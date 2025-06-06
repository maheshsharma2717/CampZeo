import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../../services/app-service.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-organisation',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './create-organisation.component.html',
  styleUrl: './create-organisation.component.css'
})
export class CreateOrganisationComponent {
  constructor(private service: AppService, private toaster: ToastrService,private router:Router) { }
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    ownerName: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    address: new FormControl('', Validators.required)
});

  onSubmit() {
    debugger;
    var request  = {data:this.form.value};
    this.service.CreateOrganisation(request).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.toaster.success("Organisation Created Successfuly")
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
}
