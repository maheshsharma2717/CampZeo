import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PasswordChangeGuard implements CanActivate {

  constructor(private router: Router, private toastr: ToastrService) {}

  canActivate(): boolean {
    
    const isFirstLogin = localStorage.getItem('IsFirstLogin') === 'true';

    if (isFirstLogin) {
      this.toastr.warning('Please change your password before continuing');
      this.router.navigate(['/profile']);
      return false;
    }

    return true;
  }
}
