import { Component, OnInit } from '@angular/core';
import { AppService } from '../services/app-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,CommonModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css'
})
export class ChangePasswordDialogComponent implements OnInit {
  pwForm!: FormGroup;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    public service: AppService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pwForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
          ],
        ],
        renewPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword')?.value;
    const renewPassword = formGroup.get('renewPassword')?.value;
    return newPassword === renewPassword ? null : { mismatch: true };
  }

  UpdatePassword() {
    if (this.pwForm.valid) {
      const formValue = this.pwForm.value;
      formValue.userId = this.service.User.id;

      const request = { data: formValue };

      this.service.UpdatePassword(request).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.toastr.success('Password updated successfully');
            this.pwForm.reset();
            this.dialogRef?.close();
            this.router.navigate(['/dashboard']);
            localStorage.setItem('IsFirstLogin', 'false');
            sessionStorage.removeItem('FirstLoginDialogShown');
          }
        },
        error: () => {
          this.toastr.error('Failed to update password');
        },
      });
    } else {
      this.toastr.error('Form is invalid or passwords do not match');
    }
  }
}
