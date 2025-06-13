import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../services/app-service.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-platform-configuration',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule,RouterModule],
  templateUrl: './platform-configuration.component.html',
  styleUrl: './platform-configuration.component.css'
})
export class PlatformConfigurationComponent {
  constructor(public service: AppService, private toastr: ToastrService) {

  }
  type: number = 0;
  data: any = {};
  ChangeType(selectedType: number = 1) {
    debugger;
    var req = {
      data: selectedType
    }
    this.service.GetPlatformConfigurations(req).subscribe({
      next: (response: any) => {
        this.data = response.data;
        this.type = response.data.type
      }
    })
  }

  updateRecord(item: any) {
    debugger;
    var req = {
      data: item
    }
    this.service.UpdatePlatformConfiguration(req).subscribe({
      next: (response: any) => {
        this.toastr.success(response.data);
      }
    })
  }

}
