import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EditService, FilterService, GridComponent, GridModule, PageService, SelectionService, SortService, ToolbarService } from '@syncfusion/ej2-angular-grids';
@Component({
  selector: 'app-event',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule, RouterModule, GridModule],
  providers: [
    PageService,
    SortService,
    FilterService,
    ToolbarService,
    SelectionService,
    EditService
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent implements OnInit {
  @ViewChild('grid') grid: any;
  contacts: any[] = [];
  filteredContacts: any[] = [];
  selectedTemplate: any;
  messageContent: string = '';
  id: any;
  selectedTemplateId: any;
  page: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 20, 100, 200, 1000];
  total: number = 0;
  allSelected: boolean = false;
  searchTerm: string = '';
  Post: any;
  activeTab: string = 'SMS';
  public toolbar: string[] = ['Search'];
  public pageSettings = { pageSize: this.itemsPerPage };
  //insta fb changes
  accessToken: string = localStorage.getItem('access_token') || '';
  pages: any[] = [];
  selectedPage: any;
  instagramUserId: string = '';
  videoUrl: string | ArrayBuffer | null = null;
  constructor(private service: AppService, private toaster: ToastrService, private router: Router, private activatedRoutes: ActivatedRoute) {
    this.activatedRoutes.queryParams.subscribe(param => {
      this.id = param['id']
    })
  }

  ngOnInit(): void {
    this.GetData();
    if (this.accessToken) {
      this.service.getFacebookPages(this.accessToken).subscribe({
        next: (res: any) => {
          this.pages = res.data || [];
        },
        error: err => {
          console.error('Failed to load pages:', err);
        }
      });
    }
  }
  GetData() {

    this.service.GetEventForCampaignPost({ data: this.id }).subscribe({
      next: (response: any) => {

        this.contacts = response.data.contacts
        this.Post = response.data.post
        this.filteredContacts = this.contacts
        this.total = this.contacts.length;
        this.videoUrl = this.Post?.videoUrl || '';
        this.setActiveTab();
      }
    })
  }
  setActiveTab(): void {
    if (this.Post.type == 1) {
      this.activeTab = 'email';
    } else if (this.Post.type == 2) {
      this.activeTab = 'SMS';
    } else if (this.Post.type == 3) {
      this.activeTab = 'whatsApp';
    } else if (this.Post.type == 4) {
      this.activeTab = 'rcs';
    }
    else if (this.Post.type == 5) {
      this.activeTab = 'facebook';
    }
    else if (this.Post.type == 6) {
      this.activeTab = 'instagram';
    }
    else if (this.Post.type == 7) {
      this.activeTab = 'linkedIn';
    }
  }
  onTabClick(tab: string): void {
    this.activeTab = tab;
  }

  sendMessage() {
    debugger
    // const campaignId = 0;
    // if (!campaignId) return;
    const campaignId = this.Post?.campaignId;
    if (!campaignId) {
      this.toaster.error('Campaign ID is missing.');
      return;
    }
    const facebookRaw = this.Post?.message || '';
    const instagramRaw = this.Post?.message || '';
    const fbContent = this.extractContent(facebookRaw);
    const igContent = this.extractContent(instagramRaw);
    const pageId = this.selectedPage?.id;
    const pageAccessToken = this.selectedPage?.access_token;
    if (this.activeTab === 'facebook' && pageId && pageAccessToken) {
      this.service.postToFacebook({
        pageId,
        pageAccessToken,
        message: fbContent.text,
        images: fbContent.images,
        videos: fbContent.videos
      }).subscribe({
        next: () => {
          this.toaster.success('Posted to Facebook successfully!');
          this.router.navigate(['list-campaigns']);
        },
        error: err => {
          console.error('Facebook post failed:', err);
          this.toaster.error('Failed to post to Facebook.');
        }
      });

    } else if (this.activeTab === 'instagram' && this.instagramUserId && pageAccessToken) {
      const igContent = this.extractContent(instagramRaw);

      if (this.videoUrl) {
        const payload: any = {
          instagramUserId: this.instagramUserId,
          accessToken: pageAccessToken,
          caption: igContent.text,
          videos: [this.videoUrl]
        };

        this.service.postToInstagram(payload).subscribe({
          next: () => {
            this.toaster.success('Posted video to Instagram successfully!');
            this.router.navigate(['list-campaigns']);
          },
          error: err => {
            console.error('Instagram post failed:', err);
            this.toaster.error('Failed to post to Instagram.');
          }
        });

      } else {
        let base64Image = igContent.images[0];

        if (!base64Image) {
          this.toaster.warning('Instagram requires an image or video. Please add one.');
          return;
        }

        this.service.uploadMedia(base64Image).subscribe({
          next: (uploadedImageUrl) => {
            const payload: any = {
              instagramUserId: this.instagramUserId,
              accessToken: pageAccessToken,
              caption: igContent.text,
              imageUrl: uploadedImageUrl
            };

            this.service.postToInstagram(payload).subscribe({
              next: () => {
                this.toaster.success('Posted image to Instagram successfully!');
                this.router.navigate(['list-campaigns']);
              },
              error: err => {
                console.error('Instagram post failed:', err);
                this.toaster.error('Failed to post to Instagram.');
              }
            });
          },
          error: err => {
            console.error('Image upload failed:', err);
            this.toaster.error('Failed to upload image.');
          }
        });
      }
    }
    else {
      const selectedContacts = this.grid.getSelectedRecords();
      if (!selectedContacts || selectedContacts.length === 0) {
        this.toaster.warning('Please select at least one contact.', 'Warning');
        return;
      }
      const platformTypeMap: any = {
        email: 1,
        SMS: 2,
        whatsApp: 3,
        RCS: 4
      };
      const platformType = platformTypeMap[this.activeTab];
      if (platformType === undefined) {
        this.toaster.error('Invalid platform type selected.');
        return;
      }
      const request = {
        data: {
          campaignId: campaignId,
          type: platformType,
          message: this.Post?.message || '',
          contacts: selectedContacts.map((c: any) => ({
            contactName: c.contactName,
            contactEmail: c.contactEmail,
            contactMobile: c.contactMobile,
            contactWhatsApp: c.contactWhatsApp
          }))
        }
      };
      this.service.SendCampPost(request).subscribe({
        next: (response: any) => {
          this.toaster.success(response.data);
          this.router.navigate(['list-campaigns']);
        },
        error: err => {
          console.error('Campaign post failed:', err);
          this.toaster.error('Failed to send message.');
        }
      });
    }
  }

  checkChange(i: number) {
    if (this.contacts[i].selected == true) {
      this.contacts[i].selected = false;
    } else {
      this.contacts[i].selected = true;
    }
  }
  selectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allSelected = isChecked;
    this.contacts.forEach(contact => {
      contact.selected = isChecked;
    });
  }
  onIndividualCheckChange() {
    this.allSelected = this.contacts.every(contact => contact.selected);
  }
  pageChangeEvent(event: number) {
    this.page = event;
  }
  // onItemsPerPageChange(value: number): void {
  //   this.itemsPerPage = value;
  //   this.page = 1;
  // }

  onSearchChange(): void {
    if (this.searchTerm) {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.contactName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.contactMobile.includes(this.searchTerm) ||
        contact.contactWhatsApp.includes(this.searchTerm)
      );
    } else {
      this.filteredContacts = this.contacts;
    }
    this.total = this.filteredContacts.length;
    this.page = 1;
  }
  GetHtml(message: any) {
    if (!message) {
      return '';
    }
    var html = message.split('[{(break)}]');
    return html[0];
  }

  //instagram fb changes
  onPageSelect(): void {
    this.instagramUserId = '';
    if (this.selectedPage?.id && this.selectedPage?.access_token) {
      this.service.getInstagramUserId(this.selectedPage.id, this.selectedPage.access_token).subscribe({
        next: (res: any) => {
          this.instagramUserId = res.instagramUserId;
        },
        error: () => {
          console.warn('This page has no connected Instagram business account.');
        }
      });
    }
  }
  extractContent(message: string) {
    if (!message) return { text: '', images: [], videos: [] };
    const htmlParts = message.split('[{(break)}]');
    const html = htmlParts[0];
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent?.trim() || '';
    const images: string[] = [];
    doc.querySelectorAll('img').forEach(img => {
      if (img.src.startsWith('data:image')) {
        images.push(img.src);
      }
    });

    const videos: string[] = [];
    doc.querySelectorAll('video').forEach(video => {
      if (video.src.startsWith('data:video')) {
        videos.push(video.src);
      }
    });

    return { text, images, videos };
  }

  onItemsPerPageChange(value: number) {
    this.pageSettings = { pageSize: value };
  }

}
