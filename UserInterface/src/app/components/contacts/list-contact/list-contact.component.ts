import { Component, OnInit } from '@angular/core';
import { GridModule, PageService, SortService, FilterService, ToolbarService } from '@syncfusion/ej2-angular-grids';
import { CommonModule } from '@angular/common';
import { AppService } from '../../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-list-contact',
  standalone: true,
  imports: [
    CommonModule,
    GridModule,
    RouterModule
  ],
  providers: [PageService, SortService, FilterService, ToolbarService],
  templateUrl: './list-contact.component.html',
  styleUrl: './list-contact.component.css'
})

export class ListContactComponent implements OnInit {
  Contacts: any[] = [];
  pageSettings = { pageSize: 10, pageSizes: [5, 10, 20, 50, 100] };
  toolbar = ['Search'];
  searchSettings = { fields: ['contactName', 'contactEmail', 'contactMobile'], operator: 'contains', ignoreCase: true };
  deleteId: number | undefined;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getContacts();
  }

  getContacts() {
    this.service.GetContacts().subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.Contacts = response.data;
          //this.toastr.success('Contacts loaded successfully');
        } else {
          this.toastr.warning(response.message);
        }
      },
      error: () => this.toastr.error('Failed to load contacts')
    });
  }

  openDeleteContactModal(id: any) {
    this.deleteId = id;
    const modal = document.getElementById('deleteContactModal');
    if (modal) {
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
    }
  }
  closeCampaignModal(): void {
    const modal = document.getElementById('deleteContactModal');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance?.hide();
      }
    }
  }
  deleteContact() {
    let request = {
      data: this.deleteId
    }
    this.service.deleteContact(request).subscribe({
      next: (res: any) => {
        this.toastr.info(res.message);
        this.getContacts();
        this.closeCampaignModal();
      },
      error: () => this.toastr.error('Failed to delete contact.')
    })
  }

}
