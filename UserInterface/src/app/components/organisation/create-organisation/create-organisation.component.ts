import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-organisation',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './create-organisation.component.html',
  styleUrl: './create-organisation.component.css'
})
export class CreateOrganisationComponent implements OnInit {
  organisationId: any;
  editMode: boolean = false;
  organisationDeatails: any;

  constructor(public service: AppService, private toaster: ToastrService, private router: Router, private activatedRoutes: ActivatedRoute, private http: HttpClient) {
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
    address: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    postalCode: new FormControl('', Validators.required),
    organisationPlatform: new FormControl([[]]),
  });
  SelectedPlatforms: any[] = []

  // ngOnInit(): void {
  //   this.activatedRoutes.queryParams.subscribe({
  //     next: (param: any) => {
  //       this.organisationId = param['id'];

  //       if (this.organisationId > 0 && this.organisationId != null) {
  //         var req = { data: parseInt(this.organisationId ?? "0") }

  //         this.service.getOrganisationByorgId(req).subscribe({
  //           next: (res: any) => {
  //             this.form.patchValue(res.data);
  //             this.SelectedPlatforms = res.data.organisationPlatform || [];
  //           }
  //         })
  //       }
  //     }
  //   })
  // }

  ngOnInit(): void {
  this.activatedRoutes.queryParams.subscribe({
    next: (param: any) => {
      this.organisationId = param['id'];

      if (this.organisationId > 0 && this.organisationId != null) {
        const req = { data: parseInt(this.organisationId ?? "0") };

        this.service.getOrganisationByorgId(req).subscribe({
          next: (res: any) => {
            this.form.patchValue(res.data);
            this.SelectedPlatforms = res.data.organisationPlatform || [];

            // Optional: Trigger location fetch if postal code exists in response
            const postalCode = res.data.postalCode;
            if (postalCode && postalCode.length === 6) {
              this.fetchLocationFromPin(postalCode);
            }
          }
        });
      }
    }
  });

  // Watch for postalCode field changes
  this.form.get('postalCode')?.valueChanges.subscribe(pinCode => {
    if (pinCode && pinCode.length === 6) {
      this.fetchLocationFromPin(pinCode);
    }
  });
}

  selectType(platform: any) {
    if (this.checkSelected(platform)) {
      this.SelectedPlatforms = this.SelectedPlatforms.filter((p: any) => p.platform !== platform);
      return;
    }
    this.SelectedPlatforms.push({
      platform: platform
    });
  }
  checkSelected(platform: any) {
    return this.SelectedPlatforms.find((p: any) => p.platform == platform) !== undefined;
  }
  onSubmit() {
    var payload = this.form.value;
    payload.organisationPlatform = this.SelectedPlatforms;
    var request = { data: this.form.value };

    if (parseInt(this.organisationId) > 0) {
      request.data.id = this.organisationId
    } else {
      request.data.id = 0;
    }

    this.service.CreateOrganisation(request).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          const message = this.editMode ? "Organisation Updated Successfully" : "Organisation Created Successfully";
          this.toaster.success(message);
          this.router.navigate(['/list-organisation'])
        }
      }
    })

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

  fetchLocationFromPin(pinCode: string): void {
  this.service.getLocation(pinCode).subscribe({
    next: (res) => {
      this.form.patchValue({
        city: res.city,
        state: res.state,
        country: res.country
      });
    },
    error: () => {
      this.form.patchValue({ city: '', state: '', country: '' });
    }
  });
}
}
