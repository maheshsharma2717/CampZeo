import { Component, EventEmitter, Output } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-campaign-posts-popup',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule,RouterModule],
  templateUrl: './campaign-posts-popup.component.html',
  styleUrl: './campaign-posts-popup.component.css'
})
export class CampaignPostsPopupComponent {
  @Output() togglePopup = new EventEmitter();
  posts: any[] = [];
  searchTerm: string = '';
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 20, 100, 200, 1000];
  page: number = 1;
  total: number = 0;
  constructor(private service: AppService, private toastr: ToastrService, private sanitizer: DomSanitizer, private router: Router) {

  }
  showPosts(campaignId: number) {
    var request: any = {
      "data": {
        "pageSize": this.itemsPerPage,
        "pageNumber": this.page,
        "searchText": this.searchTerm,
        "sortBy": "id",
        "sortDesc": true,
        "parentId": campaignId
      }
    }
    this.service.GetCampaignPostsByCampaignId(request).subscribe({
      next: (response: any) => {
        this.posts = response.data.list;
        this.total = response.data.totalCount
        this.togglePopup.emit()
      }
    })
  }
}
