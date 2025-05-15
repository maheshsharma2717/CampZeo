import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ChangePasswordDialogComponent } from '../../change-password-dialog/change-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  IsEditing: boolean = false;
  editProfileForm: any = FormGroup;
  pwForm: any = FormGroup;
  showCurrent: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;
  constructor(public service: AppService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private route: ActivatedRoute, private dialog: MatDialog) { }
  ngOnInit(): void {
    if (!this.service.User.firstName) {
      this.IsEditing = true;
    }
    this.editProfileForm = this.fb.group({
      firstName: [
        this.service.User.firstName,
        [Validators.required, Validators.pattern('^[a-zA-Z ]+$')],
      ],
      lastName: [
        this.service.User.lastName,
        [Validators.required, Validators.pattern('^[a-zA-Z ]+$')],
      ],
      email: [
        this.service.User.email,
        [Validators.required, Validators.email],
      ],
      mobile: [
        this.service.User.mobile,
        [
          Validators.required,
          Validators.pattern('^[0-9+()\\-\\s]*$'),
        ],
      ],
      address: [this.service.User.address],
    });

    this.pwForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\W).+$/)]],
      renewPassword: ['', Validators.required]
    });
   
    const isFirstLogin = localStorage.getItem('IsFirstLogin') === 'true';
    const isDialogShown = sessionStorage.getItem('FirstLoginDialogShown') === 'true';
    const userRole = Number(localStorage.getItem('UserRole'));

    if (isFirstLogin  && userRole !== 1) {
      this.dialog.open(ChangePasswordDialogComponent, {
        disableClose: true,
        width: '400px',
      });

      sessionStorage.setItem('FirstLoginDialogShown', 'true');
    }
  }
  passwordsMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
  EditProfile() {
    this.IsEditing = true;
  }
  onSubmit(): void {
    if (this.editProfileForm.valid) {
      var request = { data: this.editProfileForm.value };
      request.data.id = this.service.User.id;
      this.service.UpdateUser(request).subscribe({
        next: (response: any) => {
          this.toastr.success("User Updated Successfully");
          this.service.User = response.data;
          this.IsEditing = false;
        }
      })
    } else {
      this.toastr.warning("You need to fill required fields")
    }
  }
  cancel(): void {
    this.editProfileForm.reset(this.service.User);
    this.IsEditing = false;
  }
  UpdatePassword() {
    if (this.pwForm.valid && this.pwForm.value.newPassword === this.pwForm.value.renewPassword) {
      const formValue = this.pwForm.value;
      formValue.userId = this.service.User.id;
      const request = { data: formValue };
      this.service.UpdatePassword(request).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.toastr.success('Password updated successfully');
            this.pwForm.reset();
            localStorage.setItem('IsFirstLogin', 'false');
          }
        },
        error: (er) => {
          this.toastr.error('Failed to update password');
        }
      });
    } else {
      this.toastr.error('Form is invalid or passwords do not match');
    }
  }
}
