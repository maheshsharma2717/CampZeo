import { Component, OnInit, OnDestroy } from '@angular/core';
import { Route, Router, RouterModule, NavigationStart } from '@angular/router';
import { AppService } from '../../../services/app-service.service';
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe, NgFor } from '@angular/common';
import * as bootstrap from 'bootstrap'; import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-campaign',
  standalone: true,
  imports: [NgFor, RouterModule, CommonModule, FormsModule,NgxPaginationModule],
  templateUrl: './list-campaign.component.html',
  styleUrl: './list-campaign.component.css',
  providers: [DatePipe, { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: "yyyy-MM-ddTHH:mm:ss" }]
})
export class ListCampaignComponent implements OnInit, OnDestroy {

  private routerSubscription: Subscription | null = null;
  Campaigns: any[] = [];
  modalTitle: string = '';
  modalContentAll: any = {};
  // modalContentAll: any[] =[];
  smsPlatForm: string = '';
  selectedItem: number = 0;
  type: number = 0
  campaignId: number = 0;
  templateId: number = 0;
  selectedTemplateId: number = 0;
  searchQuery: string = '';
  filteredModalContentAll: any[] = [];
  originalContacts: any[] = [];
  searchTerm: string = '';
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5,20, 100, 200, 1000];
  page: number = 1;
  total: number = 0;
  constructor(private service: AppService,private toastr: ToastrService, private sanitizer: DomSanitizer, private router: Router) {

  }
  ngOnInit(): void {
    this.service.GetCampaigns().subscribe({
      next: (response: any) => {
        this.Campaigns = response.data;
        this.originalContacts=this.Campaigns;
        this.total = this.Campaigns.length;
        if (response.isSuccess) {
        //this.toastr.success(response.message)
        this.toastr.success('Campaigns loaded successfully')
        }
        else{
          this.toastr.warning(response.message)
        }
      }
    });
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeModal();
        this.cleanupBackdrop();
      }
    });
  }

  openModal(platform: string, item: any): void {
    this.smsPlatForm = platform;
    this.campaignId = item.id;
    if (this.smsPlatForm === "SMS") {
      this.type = 2;
    } else if (this.smsPlatForm === "Email") {
      this.type = 1;
    } else if (this.smsPlatForm === "WhatsApp") {
      this.type = 3;
    } else if (this.smsPlatForm === "RCS") {
      this.type = 4;
    }    else if (this.smsPlatForm === "Facebook") {
      this.type = 5;
    }    else if (this.smsPlatForm === "Instagram") {
      this.type = 6;
    }
    this.modalTitle = `${platform} template gallery`;

    const modalElement = document.getElementById('platformModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
      localStorage.setItem("campainId", item.id);

      this.service.GetMessageTemplateDetails(this.type, item.id).subscribe({
        next: (response: any) => {
          this.modalContentAll = response.data.messageTemplates || [];
          this.selectedTemplateId = response.data.selectedTemplateId;

          this.filteredModalContentAll = [...this.modalContentAll];
        },
      });
    }
  }

  filterTemplates(): void {
    debugger;
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredModalContentAll = [...this.modalContentAll];
    } else {
      this.filteredModalContentAll = this.modalContentAll.filter((item: any) =>
        item.subject?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.message?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }


  addTemplateToCampaign() {
    const data = {
      data: {
        templateId: this.selectedItem,
        type: this.type,
        campaignId: this.campaignId
      },

    };
    debugger;
    this.service.createCampaignMessageTemplate(data).subscribe((response: any) => {
      this.closeModal();
    })
  }
  GetHtml(message: any) {
    var html = message.split('[{(break)}]');
    return html[0];
  }
  closeModal() {
    const modalElement = document.querySelector('#platformModal') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }

  cleanupBackdrop(): void {
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }

  onSearchChange(): void {
    if (this.searchTerm) {
      this.Campaigns = this.originalContacts.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase()) 
      );
    } else {
      this.Campaigns = this.originalContacts;
    }

    this.total = this.Campaigns.length;
    this.page = 1;
  }
  pageChangeEvent(event: number) {
    this.page = event;
  }
}

