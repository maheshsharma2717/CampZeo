import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './add-contact.component.html',
  styleUrl: './add-contact.component.css'
})
export class AddContactComponent implements OnInit {
  ContactId: any;
  countryCodes = [
  { name: 'India', code: '+91' },
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Australia', code: '+61' },
  { name: 'Canada', code: '+1' },
  { name: 'Germany', code: '+49' },
  { name: 'France', code: '+33' },
  { name: 'China', code: '+86' },
  { name: 'Japan', code: '+81' },
  { name: 'Brazil', code: '+55' },
  { name: 'South Africa', code: '+27' },
  { name: 'Mexico', code: '+52' },
  { name: 'Russia', code: '+7' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'Singapore', code: '+65' },
  { name: 'United Arab Emirates', code: '+971' },
  { name: 'Italy', code: '+39' },
  { name: 'Spain', code: '+34' },
  { name: 'Netherlands', code: '+31' },
  { name: 'South Korea', code: '+82' }
  ];
  contactForm: any = new FormGroup({
    contactName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z ]*$/)]),
    contactEmail: new FormControl('', [Validators.required, Validators.email]),
    contactMobileCode: new FormControl('', Validators.required),
    contactWhatsAppCode: new FormControl('', Validators.required),
    contactMobile: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{7,15}$')
    ]),
    contactWhatsApp: new FormControl('', [
      Validators.pattern('^[0-9]{7,15}$')
    ]),
  });
  editMode: boolean = false;
  constructor(private service: AppService, private toastr: ToastrService, private router: Router, private activatedRoutes: ActivatedRoute) {
    activatedRoutes.queryParams.subscribe(param => {
      this.ContactId = param['contactId']
      if (this.ContactId) {
        this.editMode = true;
      }
    })
  }
  
  ngOnInit(): void {
    if (this.ContactId) {
      var request = { data: this.ContactId }
      this.service.GetContactById(request).subscribe({
        next: (response: any) => {
          const contact = response.data;
          const mobileCode = this.countryCodes.find(c => contact.contactMobile?.startsWith(c.code))?.code || '';
          contact.contactMobileCode = mobileCode;
          contact.contactMobile = mobileCode
            ? contact.contactMobile?.substring(mobileCode.length)
            : contact.contactMobile;

          // --- WHATSAPP ---
          const waCode = this.countryCodes.find(c => contact.contactWhatsApp?.startsWith(c.code))?.code || '';
          contact.contactWhatsAppCode = waCode;
          contact.contactWhatsApp = waCode
            ? contact.contactWhatsApp?.substring(waCode.length)
            : contact.contactWhatsApp;
          this.contactForm.patchValue(response.data);
        }
      })
    }
  }

  // Handle form submission
  // onSubmit() {
  //   if (this.contactForm.valid) {
  //     var request = {
  //       data: this.contactForm.value
  //     }
  //     request.data.id = parseInt(this.ContactId ?? "0")
  //     this.service.AddContact(request).subscribe({
  //       next: (response: any) => {
  //         if (this.ContactId) {
  //           this.toastr.success('Contact Updated successfuly')
  //         } else {
  //           this.toastr.success('Contact created successfuly')
  //         }
  //         this.router.navigate(['/list-contacts']);
  //       }
  //     })
  //   } else {
  //     console.error('Form is invalid');
  //   }
  // }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const formData = this.contactForm.value;

    const request = {
      data: {
        id: parseInt(this.ContactId ?? "0"),
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactMobile: `${formData.contactMobileCode}${formData.contactMobile}`,
        contactWhatsApp: formData.contactWhatsApp
          ? `${formData.contactWhatsAppCode}${formData.contactWhatsApp}`
          : ''
      }
    };

    this.service.AddContact(request).subscribe({
      next: (response: any) => {
        this.toastr.success(this.ContactId ? 'Contact updated successfully' : 'Contact created successfully');
        this.router.navigate(['/list-contacts']);
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const key = event.key;
    if (!/^\d$/.test(key)) {
      event.preventDefault();
    }
  }

}
