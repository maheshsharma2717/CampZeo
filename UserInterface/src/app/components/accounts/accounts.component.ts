import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})

export class AccountsComponent {
  pages: any[] = [];
  selectedPlatform: 'facebook' | 'instagram' | null = null;
  isFacebookConnected: boolean = false;
  isInstagramConnected: boolean = false;

  private fbAppId = '1308015943977582';
  private redirectUri = window.location.origin + '/auth-callback';
  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient,
    public service: AppService ,private toaster:ToastrService) {}
  ngOnInit(): void {
    debugger
    const userId = this.service.User.id;
  
    this.service.getFacebookTokenByUser(userId).subscribe({
      
      next: (res) => {
        const now = new Date();
        const expiry = new Date(res.expiresAt);
  
        if (res.accessToken) {
          this.isFacebookConnected = true;
          this.isInstagramConnected=true;
          this.selectedPlatform = 'facebook';
          this.selectedPlatform = 'instagram';
          this.getPages(res.accessToken);
        }
        // if (expiry > now) {
        //   this.isFacebookConnected = true;
        //   this.selectedPlatform = 'facebook';
        //   this.getPages(res.accessToken);
        // } 
        else {
          this.isFacebookConnected = false;
        }
      },
      error: () => {
       // this.isFacebookConnected = false;

      }
    });


  }

  getPages(token: string): void {
    this.service.getFacebookPages(token).subscribe((res: any) => {
        this.pages = res.data;
        this.selectedPlatform = 'facebook';
      });
  }

  // loginWithFacebook(): void {
  //   const scope = 'pages_show_list,pages_manage_posts,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_content_publish';
  //   const fbLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.fbAppId}&redirect_uri=${this.redirectUri}&scope=${scope}&response_type=code`;
  //   window.location.href = fbLoginUrl;
  // }
  loginWithFacebook(): void {
    debugger
    const scope = 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_content_publish,business_management';

    const redirectUri = encodeURIComponent(this.redirectUri);
    const state = 'facebook';
  
    const fbLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.fbAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    window.location.href = fbLoginUrl;
  }

  // postMessage(pageId: string, pageAccessToken: string, message: string) {
  //   this.service.postToFacebook(pageId, pageAccessToken, message).subscribe(() => {
  //     alert('Posted successfully!');
  //   });
  // }
  loginWithInstagram(): void {
    debugger;
    const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';
   
    const redirectUri = encodeURIComponent(this.redirectUri); 
    const state = 'instagram'; 
    const igLoginUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${this.fbAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    console.log('Instagram Login URL:', igLoginUrl);
    window.location.href = igLoginUrl;
  }
  
}
