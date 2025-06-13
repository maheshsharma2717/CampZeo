import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  actualUser: any = null;

  constructor(public service: AppService, private router: Router, private authService: AuthService, private toaster: ToastrService) {
  }
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  ngOnInit(): void {
    //this.actualUser = this.authService.getCurrentUser();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
  LogoutUser() {
    this.service.ClearToken();
    localStorage.removeItem('token');
  }

  // toggleSidebar(){
  //   this.service.toggle=!this.service.toggle;
  // }

  onAdminClick() {
    const adminToken = localStorage.getItem('admin_token');

    if (adminToken) {
      // Set token
      sessionStorage.setItem('token', adminToken);
      localStorage.setItem('token', adminToken);
      this.service.SetToken(adminToken, false);
      this.toaster.success('Switched back to Admin!');
      this.router.navigateByUrl('/list-organisation').then(() => {
     localStorage.removeItem("admin_token")
        location.reload();
      });
    } else {
      this.toaster.error('Admin token not found.');
    }
  }

  checkVisible(){
    return (sessionStorage.getItem("admin_token")&&sessionStorage.getItem("admin_token")!= "")
    ||(localStorage.getItem("admin_token")&&localStorage.getItem("admin_token")!= "");
  }

}
