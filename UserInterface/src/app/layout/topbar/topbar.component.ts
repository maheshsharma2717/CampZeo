import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { RouterModule } from '@angular/router';
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
  constructor(public service:AppService){
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
}
