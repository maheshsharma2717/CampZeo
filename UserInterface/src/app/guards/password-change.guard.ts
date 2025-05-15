import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PasswordChangeGuard implements CanActivate {

  constructor(private router: Router, private toastr: ToastrService) { }

  canActivate(): boolean {
    debugger
    const isFirstLogin = localStorage.getItem('IsFirstLogin') === 'true';
    const userRole = Number(localStorage.getItem('UserRole'));
    if (isFirstLogin && userRole !== 1) {
      this.toastr.warning('Please change your password before continuing');
      this.router.navigate(['/profile']);
      return false;
    }

    return true;
  }
}
