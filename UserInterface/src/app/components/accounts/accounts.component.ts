import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { AppService } from '../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environments';
declare var google: any;

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})

export class AccountsComponent implements OnInit {
  pages: any[] = [];
  selectedPlatform: 'facebook' | 'instagram' | 'linkedIn' | 'youtube' | 'pinterest' | null = null;
  isFacebookConnected: boolean = false;
  isInstagramConnected: boolean = false;
  isLinkedInConnected: boolean = false;
  private fbAppId = '1308015943977582';
  private googleClientId = '407987005028-goqhfc0ndc8cj6sadlko00bl7jtapbut.apps.googleusercontent.com'
  private redirectUri = window.location.origin + '/auth-callback';
  linkedinClientId: any = '';
  facebookAccountName: any;
  googleAccountName: any;
  pinterestAccountName: any;
  fb: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public service: AppService,
    private toaster: ToastrService,
  ) { }

  ngOnInit(): void {
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'google-token') {
        const token = event.data.token;
        console.log('Received access token:', token);
      }
    });
    let fbVal = localStorage.getItem('connectedUser');
    if (!fbVal) {
      this.fb = false;
    }
    const userId = this.service.User.id;
    localStorage.removeItem('fbRedirect');
    this.facebookAccountName = sessionStorage.getItem('connectedUser');
    this.googleAccountName = sessionStorage.getItem('YoutubeUserName');
    this.pinterestAccountName = sessionStorage.getItem('pinterestUserName');
    this.service.connectedUser$.subscribe(name => {
      if (name) {
        this.facebookAccountName = name;
        this.isFacebookConnected = true;
        this.fb = true;
      } else {
        this.isFacebookConnected = false;
        this.fb = false;
      }
    })
    this.service.loadConnectedUser();

    this.service.getSocialMediaTokenByUser(userId).subscribe({
      next: (res: any) => {
        const now = new Date();
        const expiry = new Date(res.expiresIn);
        this.linkedinClientId = res.linkedInClientId;

        if (res.accessToken) {
          this.isFacebookConnected = true;
          this.isInstagramConnected = true;
          this.selectedPlatform = 'facebook';
          this.selectedPlatform = 'instagram';
          this.getPages(res.accessToken);

        } else {
          this.isFacebookConnected = false;
        }
        if (res.linkedInAccessToken && res.linkedInAccessToken.trim() != '') {
          this.isLinkedInConnected = true;
        }
      },
      error: () => { },
    });
  }

  getPages(token: string): void {
    
    this.service.getFacebookPages(token).subscribe((res: any) => {
      this.pages = res.data;
      this.selectedPlatform = 'facebook';
    });
  }

  loginWithFacebook(): void {
    const scope =
      'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_content_publish,business_management';
    const redirectUri = encodeURIComponent(this.redirectUri);
    const state = 'facebook';
    const fbLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.fbAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    window.location.href = fbLoginUrl;
    localStorage.setItem('fbRedirect', 'true');
  }

  loginWithInstagram(): void {
    const scope =
      //'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';
      'instagram_basic,instagram_content_publish,instagram_manage_insights,instagram_manage_comments';
    const redirectUri = encodeURIComponent(this.redirectUri);
    const state = 'instagram';
    const igLoginUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${this.fbAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    
    // console.log('Instagram Login URL:', igLoginUrl);
    window.location.href = igLoginUrl;
  }

  connectToLinkedIn() {
    const redirectUri = this.redirectUri;
    const scope = 'w_member_social profile openid';
    const state = 'linkedIn';
    const authUrl =
      `https://www.linkedin.com/oauth/v2/authorization` +
      `?response_type=code` +
      `&client_id=${this.linkedinClientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}&state=${state}`;

    window.location.href = authUrl;
  }

  connectToYoutube() {
    const clientId = '407987005028-goqhfc0ndc8cj6sadlko00bl7jtapbut.apps.googleusercontent.com';
    const redirectUri = window.location.origin + '/auth-callback';
    const state = 'youtube';
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ].join(' ');

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&prompt=consent&state=${state}`;

    window.location.href = url;
  }
  connectToPinterest() {
    const clientId = '1524471';
    const redirectUri = window.location.origin + '/auth-callback';
    const scopes = [
      'boards:read',
      'pins:read',
      'user_accounts:read',
      'boards:write',
      'pins:write',
      'user_accounts:write'
    ].join(',');

    const state = 'Pinterest';
    const url = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=${state}`;
    window.location.href = url
  }

}