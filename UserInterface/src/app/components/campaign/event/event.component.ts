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
  channels: any;
  selectedChannel: any;
  videoUrl: string | ArrayBuffer | null = null;
  imageresponse: any = null;
  vedioresponse: any = null;
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
          console.log(' Facebook API Response:', res);
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
        // Set image/video preview like list-posts
        this.imageresponse = null;
        this.vedioresponse = null;
        if (this.videoUrl && typeof this.videoUrl === 'string') {
          if (/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(this.videoUrl)) {
            this.imageresponse = this.videoUrl;
          } else if (/\.(mp4|mov|avi|wmv|flv|webm|mkv|m4v)$/i.test(this.videoUrl)) {
            this.vedioresponse = this.videoUrl;
          }
        }
        if (this.Post.type == 8) {
          // this.getChannel();
        }
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
    else if (this.Post.type == 8) {
      this.activeTab = 'youtube';
    }
    else if (this.Post.type == 9) {
      this.activeTab = 'Pinterest';
    }
  }
  onTabClick(tab: string): void {
    this.activeTab = tab;
  }

  sendMessage() {
    
    const campaignId = this.Post?.campaignId;
    if (!campaignId) {
      this.toaster.error('Campaign ID is missing.');
      return;
    }

    const rawMessage = this.Post?.message || '';
    const content = this.extractContent(rawMessage);
    const pageId = this.selectedPage?.id;

    const pageAccessToken = this.selectedPage?.access_token;

    if (this.activeTab === 'facebook') {
      // if (!pageId || !pageAccessToken) {
      //   this.toaster.error('Facebook Page ID or Access Token is missing.');
      //   return;
      // }
      this.postToFacebook(content, pageId, pageAccessToken);
    }
    else if (this.activeTab === 'instagram') {

      if (!this.instagramUserId || !pageAccessToken) {
        this.toaster.error('Instagram User ID or Access Token is missing.');
        return;
      }
      this.postToInstagram(content, pageAccessToken);
    }
    else if (this.activeTab === 'linkedIn') {
      this.postToLinkedIn(content);
    }
    else if (this.activeTab === 'youtube') {
      this.postToYoutube();
    }
    else if (this.activeTab === 'Pinterest') {
      this.postToPinterest(content, pageAccessToken);
    }
    else {
      this.postToOtherChannels(campaignId, rawMessage);
    }
  }
  private postToPinterest(content: any, pageAccessToken: any){
    const imageUrl = content.images[0];
    let payload = {
      access_token: "pina_AMA7OQQXADIHQBAAGCACSDPFL2CARGABACGSPNXWSZXULDYYSD4ETAUWHL7XOVKI6NLOJDK75MZHMCYLIO6MY7D7ZZG2PFAA",
      imageUrl: this.videoUrl,
      BoardId: "",
      Title: this.Post.subject,
      Description: ""
    }
    this.service.postToPinterest(payload).subscribe({
      next:(res: any) =>{
        console.log(res);
        this.toaster.success("Pin created successfully.");
      }
    })
  }

  private postToFacebook(content: any, pageId: string, accessToken: string) {
    
    let message = this.Post?.message || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = message;
    message = tempDiv.textContent || tempDiv.innerText || '';

    let images: string[] = [];
    let videos: string[] = [];
    if (this.videoUrl) {
      const isImage = typeof this.videoUrl === 'string' && this.videoUrl.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i);
      const isVideo = typeof this.videoUrl === 'string' && this.videoUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);
      if (isImage) {
        images = [this.videoUrl as string];
      } else if (isVideo) {
        videos = [this.videoUrl as string];
      } else if (Array.isArray(this.videoUrl)) {
        (this.videoUrl as string[]).forEach(url => {
          if (url.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i)) images.push(url);
          else if (url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i)) videos.push(url);
        });
      }
    }

    this.service.postToFacebook({
      pageId,
      pageAccessToken: accessToken,
      message: message,
      images: images,
      videos: videos
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
  }

 private postToInstagram(content: any, accessToken: string) {
  let caption = this.Post?.message || '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = caption;
  caption = tempDiv.textContent || tempDiv.innerText || '';
 
  let images: string[] = [];
  let videos: string[] = [];
 
  if (this.videoUrl) {
    const isImage = typeof this.videoUrl === 'string' && this.videoUrl.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i);
    const isVideo = typeof this.videoUrl === 'string' && this.videoUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);
   
    if (isImage) {
      images = [this.videoUrl as string];
    } else if (isVideo) {
      videos = [this.videoUrl as string];
    } else if (Array.isArray(this.videoUrl)) {
      (this.videoUrl as string[]).forEach(url => {
        if (url.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i)) images.push(url);
        else if (url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i)) videos.push(url);
      });
    }
  }
 
  const payload = {
    instagramUserId: this.instagramUserId,
    accessToken,
    caption,
    images,
    videos
  };
 
  if (images.length === 0 && videos.length === 0) {
    this.toaster.warning('Instagram requires an image or video. Please add one.');
    return;
  }
 
  this.service.postToInstagram(payload).subscribe({
    next: () => {
      this.toaster.success('Posted to Instagram successfully!');
      this.router.navigate(['list-campaigns']);
    },
    error: err => {
      console.error('Instagram post failed:', err);
      this.toaster.error('Failed to post to Instagram.');
    }
  });
}


  private postToLinkedIn(content: any) {
    let text = this.Post?.message || '';
    const mediaUrl = this.videoUrl;

    if (!mediaUrl) {
      this.toaster.warning('LinkedIn requires an image or video. Please add one.');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    text = tempDiv.textContent || tempDiv.innerText || '';

    let payload: any = { caption: text };
    const isImage = typeof mediaUrl === 'string' && mediaUrl.match(/\.(jpeg|jpg|png|gif|bmp|webp)$/i);
    const isVideo = typeof mediaUrl === 'string' && mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);

    if (isImage) {
      payload.imageUrl = mediaUrl;
    } else if (isVideo) {
      payload.videoUrl = mediaUrl;
    } else {
      payload.imageUrl = mediaUrl;
    }

    this.sendLinkedInPost(payload);
  }

  private sendLinkedInPost(payload: any) {
    this.service.postToLinkedIn(payload).subscribe({
      next: () => {
        this.toaster.success('Posted to LinkedIn successfully!');
        this.router.navigate(['list-campaigns']);
      },
      error: (err: any) => {
        console.error('LinkedIn post failed:', err);
        this.toaster.error('Failed to post to LinkedIn.');
      }
    });
  }
  getChannel() {
    let google_access_token = localStorage.getItem("google_access_token");
    this.service.getYoutubeChannel(google_access_token).subscribe({
      next: (res: any) => {
        console.log(res)
      }
    })
  }

  private async postToYoutube() {
    let google_access_token = localStorage.getItem("google_access_token");
    let description = this.Post?.message || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    description = tempDiv.textContent || tempDiv.innerText || '';
    console.log('YouTube Description (plain text):', description);

    const payload = {
      accessToken: google_access_token,
      title: this.Post.subject,
      description: description, // plain text only
      tags: ['angular', 'youtube', 'upload'],
      categoryId: '22',
      privacyStatus: 'public',
      videoUrl: this.videoUrl,
      Videos: Array.isArray(this.videoUrl) ? this.videoUrl : [this.videoUrl]
    };

    this.service.uploadToYoutube(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        this.toaster.success("Video successfully uploaded to youtube.");
      }
    })
  }


  private postToOtherChannels(campaignId: number, message: string) {
    
    const selectedContacts = this.filteredContacts.filter(c => c.selected);
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
        campaignId,
        type: platformType,
        message,
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
  // extractContent(message: string) {
  //   if (!message) return { text: '', images: [], videos: [] };
  //   const htmlParts = message.split('[{(break)}]');
  //   const html = htmlParts[0];
  //   const doc = new DOMParser().parseFromString(html, 'text/html');
  //   const text = doc.body.textContent?.trim() || '';
  //   const images: string[] = [];
  //   doc.querySelectorAll('img').forEach(img => {
  //     if (img.src.startsWith('data:image')) {
  //       images.push(img.src);
  //     }
  //   });

  //   const videos: string[] = [];
  //   doc.querySelectorAll('video').forEach(video => {
  //     if (video.src.startsWith('data:video')) {
  //       videos.push(video.src);
  //     }
  //   });

  //   return { text, images, videos };
  // }


  extractContent(message: string) {
  if (!message) return { text: '', images: [], videos: [] };

  const htmlParts = message.split('[{(break)}]');
  const html = htmlParts[0];
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const text = doc.body.textContent?.trim() || '';

  const images: string[] = [];
  doc.querySelectorAll('img').forEach(img => {
    if (img.src && (img.src.startsWith('data:image') || img.src.startsWith('http') || img.src.startsWith('/assets'))) {
      images.push(img.src);
    }
  });

  const videos: string[] = [];
  doc.querySelectorAll('video').forEach(video => {
    if (video.src && (video.src.startsWith('data:video') || video.src.startsWith('http'))) {
      videos.push(video.src);
    }
  });

  return { text, images, videos };
}


  onItemsPerPageChange(value: number) {
    this.pageSettings = { pageSize: value };
  }

  get isContactPlatform(): boolean {
    return ['SMS', 'email', 'whatsApp'].includes(this.activeTab);
  }
}
