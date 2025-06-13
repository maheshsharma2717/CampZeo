import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup
  showPassword: any;
  token: any;

  constructor(private activatedRoute: ActivatedRoute, private service: AppService, private tostr: ToastrService, private router: Router) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    })
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(paramlist => {
      this.token = paramlist.get('token');
    })
  }

  onSubmit() {
    let newPass = this.resetPasswordForm.get('newPassword')?.value;
    let confirmPass = this.resetPasswordForm.get('confirmPassword')?.value;

    if (this.resetPasswordForm.valid) {
      if (newPass === confirmPass) {

        let request = {
          token: this.token,
          password: newPass
        }
        this.service.resetUserPassword(request).subscribe({
          next:(res: any) =>{
            console.log(res)
            if (res.isSuccess == true) {
              this.tostr.success("Your password have been changed successfully.");
              this.router.navigate(['login']);
            }else{
              this.tostr.error(res.message);
            }
          }
        })
      }else{
        this.tostr.error("Password didn't matched!");
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
