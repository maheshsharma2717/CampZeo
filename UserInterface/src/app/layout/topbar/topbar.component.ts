import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  constructor(public service:AppService,private router: Router)
  {
  }
  @Input() collapsed = false;
 @Output() toggleSidebar = new EventEmitter<boolean>();

onToggleSidebar() {
  this.toggleSidebar.emit();
}
LogoutUser() {
this.service.ClearToken()
}
// toggleSidebar(){
//   this.service.toggle=!this.service.toggle;
// }

onAdminClick() {
  debugger;
  const adminToken = localStorage.getItem('admin_token');

  if (adminToken) {
    
    sessionStorage.setItem('token', adminToken);  
    localStorage.setItem('token', adminToken);  
    this.service.SetToken(adminToken, false);   

   // this.toaster.success('Switched back to Admin!');
   this.router.navigate(['/list-organisation']); 
    location.reload();
  } else {
    //this.toaster.error('Admin token not found.');
  }
}
}
