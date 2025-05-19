import { Component } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-list-posts',
  standalone: true,
  imports: [RouterModule, NgxPaginationModule, CommonModule, FormsModule],
  templateUrl: './list-posts.component.html',
  styleUrl: './list-posts.component.css'
})
export class ListPostsComponent {
  CampaignPosts: any[] = [];
  filteredModalContentAll: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 20, 100, 200];
  total: number = 0;
  campaignId: any=0;
  Campaign: any={};
  constructor(private toastr: ToastrService, private service: AppService, private activatedRoutes: ActivatedRoute) {
    this.activatedRoutes.queryParams.subscribe(param => {
this.campaignId=param['campaignId']
    })
  }
  typeMapping: { [key: number]: string } = {
    1: 'Email',
    2: 'SMS',
    3: 'WhatsApp',
    4: 'RCS',
    5: 'Facebook',
    6: 'Instagram'
  };

  ngOnInit(): void {
    this.GetCampaignDetails();
    this.GetCampaignPosts();
  }
GetCampaignPosts(){
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
          this.toastr.success('Campaign Posts loaded successfully')
        }
        else {
          this.toastr.warning(response.message)
        }
      }
    });

}
GetCampaignDetails(){
    var request = { data: parseInt(this.campaignId ?? "0") }
      this.service.GetCampaignById(request).subscribe({
        next: (response: any) => {
          this.Campaign=response.data
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

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }

  onSearchChange(): void {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (searchTerm) {
      this.CampaignPosts = this.filteredModalContentAll.filter((campaignPost) => {
        const subject = campaignPost.subject?.toLowerCase() || '';
        const message = campaignPost.message?.toLowerCase() || '';
        const senderEmail = campaignPost.senderEmail?.toLowerCase() || '';
        const organisationName = campaignPost.organisationName?.toLowerCase() || '';
        const type = this.typeMapping[campaignPost.type]?.toLowerCase() || '';

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
}
