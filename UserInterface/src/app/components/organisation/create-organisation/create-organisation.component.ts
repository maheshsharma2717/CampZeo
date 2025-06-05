import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-organisation',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-organisation.component.html',
  styleUrl: './create-organisation.component.css'
})
export class CreateOrganisationComponent implements OnInit {
  organisationId: any;
  editMode: boolean = false;
  organisationDeatails: any;
  constructor(private service: AppService, private toaster: ToastrService, private router: Router, private activatedRoutes: ActivatedRoute) {
    activatedRoutes.queryParams.subscribe(param => {
      this.organisationId = param['id'];
      if (this.organisationId) {
        this.editMode = true;
      }
    })
  }
  form = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('', Validators.required),
    ownerName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    address: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.activatedRoutes.queryParams.subscribe({
      next: (param: any) => {
        this.organisationId = param['id'];
      }
    })
    var req = { data: parseInt(this.organisationId ?? "0") }

    this.service.getOrganisationByorgId(req).subscribe({
      next: (res: any) =>{
        this.form.patchValue(res.data)
      }
    })
  }

  onSubmit() {
    const payload = this.form.value;
    if (this.organisationId) {
      const numericId = Number(this.organisationId);

      this.service.UpdateOrganisation(numericId, payload).subscribe({
        next: (response: any) => {
          this.toaster.success("Organisation Updated Successfully");
          this.router.navigate(['/list-organisation']);
        },
        error: (err) => {
          this.toaster.error("Failed to update organisation");
          console.error('Update failed:', err);
        }
      });
    } else {
      var request = { data: this.form.value };

      if (parseInt(this.organisationId) > 0) {
        request.data.id = this.organisationId
      } else {
        request.data.id = 0;
      }

      this.service.CreateOrganisation(request).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.toaster.success("Organisation Created Successfuly")
            this.router.navigate(['/list-organisation'])
          }
        }
      })
    }
  }
  redirectToInstagram() {
    const instagramAuthUrl = 'https://api.instagram.com/oauth/authorize' +
      '?client_id=YOUR_INSTAGRAM_APP_ID' +
      '&redirect_uri=YOUR_REDIRECT_URI' +
      '&response_type=code' +
      '&scope=user_profile,user_media';
    window.location.href = instagramAuthUrl;
  }

  redirectToFacebook() {
    const facebookAuthUrl = 'https://www.facebook.com/v12.0/dialog/oauth' +
      '?client_id=YOUR_FACEBOOK_APP_ID' +
      '&redirect_uri=YOUR_REDIRECT_URI' +
      '&state=your_state_parameter' +
      '&scope=email,public_profile';
    window.location.href = facebookAuthUrl;
  }
}
