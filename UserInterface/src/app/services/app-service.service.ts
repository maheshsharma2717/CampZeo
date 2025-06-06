import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
const ApiUrl = environment.API_BASE_URL
@Injectable({
  providedIn: 'root'
})
export class AppService {


  IsUserAuthenticated = false;
  toggle: boolean = true;
  Token: string = "";
  User: any = {};
  showSpinner: boolean = false;
  promptData: string = '';
  isChatPopupOpen: boolean = false;
  platformTypeMapping: { [key: number]: { name: string, class: string } } = {
    1: { name: 'Email', class: "fas fa-envelope-open" },
    2: { name: 'SMS', class: "fa fa-envelope text-warning" },
    3: { name: 'WhatsApp', class: "fab fa-whatsapp" },
    4: { name: 'RCS', class: "fa fa-globe" },
    5: { name: 'Facebook', class: "fab fa-facebook" },
    6: { name: 'Instagram', class: "fab fa-instagram" },
    7: { name: 'Linkedin', class: "fab fa-linkedin-in" }
  };

  constructor(private http: HttpClient, private router: Router) { }

  SetToken(token: any, rememberMe: boolean) {
    if (rememberMe) { localStorage.setItem('token', token); }
    sessionStorage.setItem('token', token);
    this.Token = token;
    this.IsUserAuthenticated = true;
  }
  ValidateToken(token: any) {
    var form = new FormData();
    form.append('token', token);
    this.http.post(ApiUrl + "Account/ValidateToken", form).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.SetToken(response.data.token, false);
          this.User = response.data;
          this.IsUserAuthenticated = true;
          if (!response.data.firstName) {
            this.router.navigate(['/profile'], { queryParams: { i: 'CompleteProfile' } });
          }
        } else {
          this.ClearToken()
        }
      }
    })
  }
  ClearToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.IsUserAuthenticated = false;
    sessionStorage.removeItem('FirstLoginDialogShown');
    localStorage.removeItem('UserRole');
    localStorage.removeItem('IsFirstLogin');
    this.router.navigate(['/'])
  }
  LoginUser(request: any) {
    return this.http.post(ApiUrl + "Account/Login", request);
  }
  CreateOrganisation(request: any) {
    return this.http.post(ApiUrl + "Organisation/CreateOrganisation", request);
  }
  ApproveOrganisation(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Organisation/ApproveOrganisation", request);
  }
  GetOrganisations(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Organisation/GetOrganisation", request);
  }
  UpdateUser(request: any) {
    return this.http.post(ApiUrl + "Account/UpdateUser", request);
  }
  UpdatePassword(request: any) {
    return this.http.post(ApiUrl + "Account/UpdatePassword", request);
  }
  AddContact(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Contact/CreateContact", request);
  }
  deleteContact(req: any){
    req.token = this.Token;
    return this.http.post(ApiUrl + 'Contact/DeleteContactById', req);
  }
  GetContactById(request: any) {
    return this.http.post(ApiUrl + "Contact/GetContact", request);
  }
  GetContacts() {
    var request = {
      token: this.Token
    }
    return this.http.post(ApiUrl + "Contact/GetContacts", request);
  }
  ImportBulkContacts(file: File) {
    const formData = new FormData();
    formData.append('data', file);  // Add the file to FormData
    formData.append('token', this.Token);  // Add token if necessary

    return this.http.post(ApiUrl + "Contact/ImportContact", formData);
  }
  GetCampaigns(request: any) {

    request.token = this.Token

    return this.http.post(ApiUrl + "Campaign/GetCampaigns", request);
  }
  GetScheduledPosts(date: any, selectMode: string | undefined) {
    var request = {
      token: this.Token,
      data: { date: date.toString(), mode: selectMode }
    }
    return this.http.post(ApiUrl + "Campaign/GetScheduledPosts", request);
  }
  GetCampaignById(request: any) {
    return this.http.post(ApiUrl + "Campaign/GetCampaignDetails", request);
  }

  AddCampaign(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Campaign/CreateCampaign", request);
  }
  
  deleteCampaignById(req: any){
    req.token = this.Token;
    return this.http.post<any>(ApiUrl + "Campaign/DeleteCampaign", req);
  }
  GetCampaignPosts() {
    var request = {
      token: this.Token
    }
    return this.http.post(ApiUrl + "CampaignPost/GetCampaignPosts", request);
  }
  GetCampaignPostsByCampaignId(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "CampaignPost/GetCampaignPostsByCampaignId", request);
  }
  AddCampaignPost(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "CampaignPost/CreateCampaignPost", request);
  }
  deleteCampaignPostById(request: any){
    request.token = this.Token;
    return this.http.post<any>(ApiUrl + 'CampaignPost/DeleteCampaignPost', request);
  }
  GetCampaignPostById(request: any) {
    return this.http.post(ApiUrl + "CampaignPost/GetCampaignPostDetails", request);
  }
  GetEventForCampaignPost(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Campaign/GetEventForCampaignPost", request);
  }
  SendBulkMessagetoContacts(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Campaign/SendBulkMessagetoContacts", request);
  }
  getLogs(request: any, reqUrl: string) {
    request.token = this.Token
    return this.http.post(ApiUrl + "Campaign/" + reqUrl, request);
  }
  TestPrompt(request: any) {
    return this.http.post(ApiUrl + "Campaign/TestDevloper", request);
  }
  GetCampaignPostDetails(type: any, campaignId: any) {
    var request = {
      data: {
        templateType: type,
        campaignId: campaignId
      },
      token: this.Token
    }
    return this.http.post(ApiUrl + "Campaign/GetCampaignsCampaignPosts", request);
  }
  createCampaignCampaignPost(request: any) {
    request.token = this.Token
    return this.http.post(ApiUrl + "Campaign/CreateCampaignCampaignPost", request);
  }
  AddCampaignPostFromCampaign(id: number, request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "CampaignPost/CreateCampaignPostFromCampain?campainId=" + id, request);
  }

  SuspendOrRecoverOrganisation(id: number) {
    var request = {
      data: id,
      token: this.Token
    }
    return this.http.post(ApiUrl + "Organisation/SuspendOrRecoverOrganisation", request);
  }
  LogInAsOrgenisation(id: any) {
    return this.http.get(ApiUrl + "Account/LogInAsOrgenisation?id=" + id);
  }

  getCampaignPostDetails() {
    var request = {
      data: 0,
      token: this.Token
    }
    return this.http.post(ApiUrl + "Organisation/GetOrgenisationById", request);
  }

  exchangeToken(code: string, userId: number, platform: string) {
    return this.http.post<any>(`${ApiUrl}socialmedia/exchange-token`, {
      code,
      userId,
      platform
    }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  getFacebookPages(accessToken: string) {
    return this.http.get<any>(`${ApiUrl}socialmedia/pages?accessToken=${accessToken}`);
  }

  getSocialMediaTokenByUser(userId: number) {
    return this.http.get<any>(`${ApiUrl}socialmedia/user-social-media-tokens/${userId}`);
  }

  // postToFacebook(pageId: string, pageAccessToken: string, message: string) {
  //   const payload = { pageId, pageAccessToken, message };
  //   return this.http.post(`${ApiUrl}socialmedia/post-facebook`, payload);
  // }

  postToFacebook(payload: {
    pageId: string;
    pageAccessToken: string;
    message: string;
    images?: string[];
    videos?: string[];
  }) {
    return this.http.post(`${ApiUrl}socialmedia/post-facebook`, payload);
  }

  getInstagramUserId(pageId: string, token: string) {
    return this.http.get(`${ApiUrl}socialmedia/instagram-business-account?pageId=${pageId}&accessToken=${token}`);
  }

  // postToInstagram(instagramUserId: string, accessToken: string, caption: string, imageUrl: string) {
  //   const payload = { instagramUserId, accessToken, caption ,imageUrl};
  //   return this.http.post(`${ApiUrl}socialmedia/post-instagram`, payload);
  // }
  postToInstagram(payload: {
    instagramUserId: string;
    accessToken: string;
    caption: string;
    imageUrl?: string;
    videos?: string[];  // should be public URLs
  }) {
    return this.http.post(`${ApiUrl}socialmedia/post-instagram`, payload);
  }

  uploadMedia(base64Data: string): Observable<string> {
    return this.http.post<{ fileUrl: string }>(`${ApiUrl}socialmedia/upload-media-file`, {
      base64: base64Data
    }).pipe(map(response => response.fileUrl));
  }

  uploadMediaFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${ApiUrl}socialmedia/upload-video-file`, formData).toPromise();
  }
  getPostInsights(postId: string, accessToken: string, platform: string) {
    const url = `${ApiUrl}SocialMedia/get-post-insights?postId=${postId}&accessToken=${accessToken}&platform=${platform}`;
    return this.http.get<any>(url);
  }
  getSocialMediaPosts() {
    return this.http.get<any>(`${ApiUrl}SocialMedia/get-all-posts`);
  }
  saveCampaignWithTemplates(payload: any) {
    const request = {
      data: payload,
      token: this.Token
    };
    return this.http.post(ApiUrl + "Campaign/SaveCampaignWithTemplates", request);
  }

  // preview clander
  // Ensure token is fetched correctly
  // GetTemplateById(payload: any): Observable<any> {

  //   const token = this.Token // Get token from local storage

  //   if (!token) {
  //     console.error('Token is missing!');
  //     throw new Error('Token is missing');  // Ensure that if token is missing, it throws an error
  //   }

  //   const requestBody = {
  //     token: token,  // Include token from local storage
  //     data: payload.data  // Use the data passed from the onEventClick function
  //   };

  //   console.log('Request Body:', requestBody);  // Debugging to check request structure
  //   return this.http.post(ApiUrl + `CampaignPost/GetPostById`, requestBody);
  // }

  GetTemplateById(templateId: number) {
    const token = this.Token;

    if (!token) {
      console.error('Token is missing!');
      throw new Error('Token is missing');
    }

    const requestBody = {
      token: token,
      data: templateId
    };

    console.log('Request Body:', requestBody);
    return this.http.post(ApiUrl + `CampaignPost/GetPostById`, requestBody);
  }

  //post

  SendCampPost(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Campaign/send-campaign-post", request);
  }
  UpdatePlatformConfiguration(request:any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "AdminPlatformConfiguration/UpdatePlatformConfiguration", request);
  }
  GetPlatformConfigurations(request:any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "AdminPlatformConfiguration/GetPlatformConfiguration", request);
  }
}

