import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
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
  isSidebarMinimized = false;
  constructor(public service: AppService, public router:Router) {

  }
  @Input() collapsed = false;
  @Input() isMobileNavOpen = false;
  @Output() togglebar = new EventEmitter<boolean>();


  toggleSidebar() {
    this.isSidebarMinimized = !this.isSidebarMinimized;
    this.collapsed = !this.collapsed;
    this.togglebar.emit(this.collapsed);
  }
  LogoutUser() {
    this.service.ClearToken()
  }


  onToggleSidebar() {
    this.togglebar.emit();
  }
}
