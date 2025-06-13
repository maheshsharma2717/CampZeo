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
      this.service.ValidateToken(adminToken);
      this.toaster.success('Switched back to Admin!');
      localStorage.removeItem("admin_token")
      this.router.navigateByUrl('/list-organisation')
    } else {
      this.toaster.error('Admin token not found.');
    }
  }

  checkVisible(){
    return (sessionStorage.getItem("admin_token")&&sessionStorage.getItem("admin_token")!= "")
    ||(localStorage.getItem("admin_token")&&localStorage.getItem("admin_token")!= "");
  }

}
