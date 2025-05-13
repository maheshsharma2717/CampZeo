import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './add-contact.component.html',
  styleUrl: './add-contact.component.css'
})
export class AddContactComponent implements OnInit {
  ContactId: any;
  contactForm:any = new FormGroup({
    contactName: new FormControl('', [Validators.required, Validators.minLength(3),Validators.pattern(/^[a-zA-Z ]*$/)]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactMobile: new FormControl('', Validators.required),
    contactWhatsApp: new FormControl('')
  });
editMode: boolean=false;
  constructor(private service: AppService, private toastr: ToastrService, private router: Router, private activatedRoutes: ActivatedRoute) {
    activatedRoutes.queryParams.subscribe(param => {
      this.ContactId = param['contactId']
      if(this.ContactId){
        this.editMode=true;
      }
    })
  }
  ngOnInit(): void {
    if (this.ContactId) {
      var request={data:this.ContactId}
      this.service.GetContactById(request).subscribe({
        next: (response: any) => {
          this.contactForm.patchValue(response.data);
        }
      })
    }
  }
  // Handle form submission
  onSubmit() {
    if (this.contactForm.valid) {
      var request={
        data:this.contactForm.value
      }
      request.data.id = parseInt(this.ContactId??"0")
      this.service.AddContact(request).subscribe({
        next: (response: any) => {
          this.toastr.success('Contact created successfuly')
          this.router.navigate(['/list-contacts']);
        }
      })
    } else {
      console.error('Form is invalid');
    }
  }
}
