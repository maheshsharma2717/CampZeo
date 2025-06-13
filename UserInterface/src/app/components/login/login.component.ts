import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule, TitleStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../../change-password-dialog/change-password-dialog.component';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ForgotPasswordComponent, ResetPasswordComponent, ReactiveFormsModule, CommonModule, RouterModule,],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  showPassword: boolean = false;
  navigateForgotPassword: boolean = false;  
  showResetScreen = false;
  token: any;

    constructor(private activatedRoute: ActivatedRoute, private toastr: ToastrService, private service: AppService,private router:Router, private authService: AuthService,
    private dialog: MatDialog) {
      this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      rememberMe: new FormControl(false)
    });
  }

  ngOnInit(): void {
    this.navigateForgotPassword = false;
    this.showResetScreen = false
    this.activatedRoute.queryParamMap.subscribe(param => {
      this.token = param.get('token');
      if (this.token){
        this.showResetScreen = true;
      }else{
        this.navigateForgotPassword = false;
        this.showResetScreen = false;
      }
    })
  }

  forgot() {
    this.router.navigate(['/forgot-password']);
    this.navigateForgotPassword = true;
  }

  onSubmit() {
  if (this.loginForm.valid) {
    const loginData = this.loginForm.value;

    this.service.LoginUser(loginData).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.service.SetToken(response.data.token, this.loginForm.value.rememberMe);
          this.authService.setCurrentUser(response.data);

          // if (response.data.role == 1) {
          //   localStorage.setItem('admin_token', response.data.token);
          // } else {
          //   localStorage.setItem('user_token', response.data.token);
          // }

          this.service.User = response.data;
          localStorage.setItem('IsFirstLogin', response.data.isFirstLogin);
          localStorage.setItem('UserRole', response.data.role);

          // this.toastr.success('Login success');

          if (response.data.isFirstLogin === true && this.service.User.role !== 1) {
            sessionStorage.setItem('FirstLoginDialogShown', 'true');
            this.router.navigate(['/profile']);
          } else if (!response.data.firstName) {
            this.router.navigate(['/profile'], { queryParams: { i: 'CompleteProfile' } });
          } else {
            if (this.service.User.role == 1) {
              this.router.navigate(['/list-organisation']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }

        } else {
          this.toastr.error('Invalid Email or password');
        }
      }
    });
  } else {
    this.toastr.error('Form is invalid');
  }
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
