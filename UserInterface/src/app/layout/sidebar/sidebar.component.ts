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
  constructor(public service: AppService , public router:Router) {

  }
  @Input() collapsed = false;
  @Input() isMobileNavOpen = false;
  

  toggleSidebar() {
    this.isSidebarMinimized = !this.isSidebarMinimized;
  }
  LogoutUser() {
    this.service.ClearToken()
    }
    
    @Output() togglebar = new EventEmitter<void>();
    
    onToggleSidebar() {
      this.togglebar.emit();
    }
}
