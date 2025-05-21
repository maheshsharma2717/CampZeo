import { Component,OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppService } from './services/app-service.service';
import { LoginComponent } from "./components/login/login.component";
import { TopbarComponent } from "./layout/topbar/topbar.component";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, TopbarComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isSidebarCollapsed = false;
  isCollapsed = false;
  isMobileNavOpen = false;
  constructor(public service: AppService, public toastr: ToastrService,) {
   
  }
  ngOnInit(){
    var token=localStorage.getItem('token');
    if(!token)token=sessionStorage.getItem('token')
   if (token) this.service.ValidateToken(token);
  }
  toggleSidebar() {
    if (window.innerWidth < 992) {
      this.isMobileNavOpen = !this.isMobileNavOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

}
