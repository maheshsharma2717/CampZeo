import { Component, EventEmitter, Output } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule,],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  constructor(public service:AppService){
  }
 @Output() toggleSidebar = new EventEmitter<void>();

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
