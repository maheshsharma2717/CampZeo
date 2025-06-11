import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitted = false;

  constructor(private service: AppService, private toaster: ToastrService) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })
  }

  onSubmit() {
    const email = this.forgotPasswordForm.get('email')?.value;
    this.service.ResetPassword(email).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.isSuccess == false) {
          this.toaster.error(res.message);
          this.isSubmitted = false;
        } else {
          this.toaster.success("Success");
          this.isSubmitted = true;
        }
      }
    })
  }

}
