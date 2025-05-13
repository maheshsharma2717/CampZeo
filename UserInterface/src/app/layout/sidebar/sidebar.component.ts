import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppService } from '../../services/app-service.service';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  showUserMenu: boolean = false;
  constructor(public service: AppService , public router:Router) {

  }
  @Input() collapsed = false;
  @Input() isMobileNavOpen = false;
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }
  LogoutUser() {
    this.service.ClearToken()
    }
}
