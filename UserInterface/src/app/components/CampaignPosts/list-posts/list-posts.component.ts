import { Component } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { GridModule, PageService, SortService, ToolbarService } from "@syncfusion/ej2-angular-grids";
import * as bootstrap from 'bootstrap'

@Component({
  selector: 'app-list-posts',
  standalone: true,
  imports: [RouterModule, NgxPaginationModule, CommonModule, FormsModule, GridModule],
  templateUrl: './list-posts.component.html',
  styleUrl: './list-posts.component.css',
  providers: [PageService, SortService, ToolbarService]
})
export class ListPostsComponent {
  deleteId: any;
  CampaignPosts: any[] = [];
  filteredModalContentAll: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 20, 100, 200];
  total: number = 0;
  campaignId: any = 0;
  Campaign: any = {};
  pageSettings = { pageSize: 10, pageSizes: [5, 10, 20, 50] };
  toolBarOptions = ['Custom'];
  //Modal priview
  isPreviewModalOpen: boolean = false;
  previewData: any;
  editorContent: string = '';
  simpleText: string = '';
  emailHtmlContent: string = '';
  jsonValue: any = {};
  isRecovering: boolean = false;

  constructor(private toastr: ToastrService, public service: AppService, private activatedRoutes: ActivatedRoute) {
    this.activatedRoutes.queryParams.subscribe(param => {
      this.campaignId = param['campaignId']
    })
  }


  ngOnInit(): void {
    this.GetCampaignDetails();
    // this.getYoutubeVideoList();
    this.GetCampaignPosts();
  }
  GetCampaignPosts() {
    var request: any = {
      "data": {
        "pageSize": this.itemsPerPage,
        "pageNumber": this.page,
        "searchText": this.searchTerm,
        "sortBy": "id",
        "sortDesc": true,
        "parentId": this.campaignId
      }
    }
    this.service.GetCampaignPostsByCampaignId(request).subscribe({
      next: (response: any) => {
        this.CampaignPosts = response.data.list;
        this.total = response.data.totalCount
        if (response.isSuccess) {
          // this.toastr.success(response.message)
          //  this.toastr.success('Campaign Posts loaded successfully')
        }
        else {
          this.toastr.warning(response.message)
        }
      }
    });

  }
  GetCampaignDetails() {
    var request = { data: parseInt(this.campaignId ?? "0") }
    this.service.GetCampaignById(request).subscribe({
      next: (response: any) => {
        this.Campaign = response.data
      }
    })
  }
  GetHtml(message: any) {
    var html = message.split('[{(break)}]');
    return html[0];
  }

  UpdateLocalStorage() {
    localStorage.setItem("campainId", "0")
  }


  getYoutubeVideoList() {
    let google_access_token = localStorage.getItem("google_access_token");
    if (!google_access_token) {
      this.toastr.error("Access token not found");
      return;
    }
    this.service.getVideoList(google_access_token).subscribe({
      next: (res: any) => {
        console.log(res);
      }
    })
  }


  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }

  delete() {
    let req = {
      data: this.deleteId
    }
    this.service.deleteCampaignPostById(req).subscribe({
      next: (res: any) => {
        this.GetCampaignPosts();
        this.toastr.info("Post deleted successfully.");
        this.closePostDeleteModal();
      }
    })
  }
  openPostDeleteModal(id: any) {
    this.deleteId = id;

    const modalElement = document.getElementById('deletePostModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
      this.isRecovering = this.isRecovering;
    }
  }

  closePostDeleteModal(): void {
    const modalElement = document.getElementById('deletePostModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance?.hide();
      }
    }
  }

  onSearchChange(): void {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (searchTerm) {
      this.CampaignPosts = this.filteredModalContentAll.filter((campaignPost) => {
        const subject = campaignPost.subject?.toLowerCase() || '';
        const message = campaignPost.message?.toLowerCase() || '';
        const senderEmail = campaignPost.senderEmail?.toLowerCase() || '';
        const organisationName = campaignPost.organisationName?.toLowerCase() || '';
        const type = this.service.platformTypeMapping[campaignPost.type]?.name.toLowerCase() || '';

        return (
          subject.includes(searchTerm) ||
          message.includes(searchTerm) ||
          senderEmail.includes(searchTerm) ||
          organisationName.includes(searchTerm) ||
          type.includes(searchTerm)
        );
      });
    } else {
      this.CampaignPosts = [...this.filteredModalContentAll];
    }

    this.total = this.CampaignPosts.length;
    this.page = 1;
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }
  openPreviewPopup(templateId: number): void {
    if (!templateId) {
      this.toastr.error('Invalid template ID.');
      return;
    }

    this.service.GetTemplateById(templateId).subscribe({
      next: (response: any) => {
        debugger
        if (response.isSuccess) {
          console.log(response.data)
          this.previewData = response.data;
          this.editorContent = this.previewData.message;
          this.simpleText = this.previewData.message;

          if (response.data.type === 1) {
            const parts = this.previewData.message.split('[{(break)}]');
            if (parts.length > 1) {
              this.emailHtmlContent = parts[0];
              try {
                this.jsonValue = JSON.parse(parts[1]);
              } catch (error) {
                console.error('Error parsing design JSON:', error);
              }
            } else {
              this.emailHtmlContent = this.previewData.message;
            }
          }

          this.isPreviewModalOpen = true;
        } else {
          this.toastr.warning(response.message || 'Failed to load template.');
        }
      },
      error: () => {
        this.toastr.error('Failed to load template preview.');
      }
    });
  }

}
