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
  constructor(private http: HttpClient, private router: Router) { }

  SetToken(token: any,rememberMe:boolean) {
   if(rememberMe){ localStorage.setItem('token', token);}
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
          this.SetToken(response.data.token,false);
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
    this.router.navigate(['/'])
  }
  LoginUser(request: any) {
    return this.http.post(ApiUrl + "Account/Login", request);
  }
  CreateOrganisation(request: any) {
    return this.http.post(ApiUrl + "Organisation/CreateOrganisation", request);
  }
  ApproveOrganisation(request: any) {
    return this.http.post(ApiUrl + "Organisation/ApproveOrganisation", request);
  }
  GetOrganisations(request: any) {
    request.token= this.Token;
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
  GetCampaigns() {
    var request = {
      token: this.Token
    }
    return this.http.post(ApiUrl + "Campaign/GetCampaigns", request);
  }
  GetScheduledPosts() {
    var request = {
      token: this.Token
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
  GetMessageTemplates() {
    var request = {
      token: this.Token
    }
    return this.http.post(ApiUrl + "MessageTemplate/GetMessageTemplates", request);
  }
  AddMessagetemplate(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "MessageTemplate/CreateMessageTemplate", request);
  }
  GetMessagetemplateById(request: any) {
    return this.http.post(ApiUrl + "MessageTemplate/GetMessageTemplateDetails", request);
  }
  GetEventForCampaign(request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "Campaign/GetEventForCampaign", request);
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
  GetMessageTemplateDetails(type: any, campaignId: any) {
    var request = {
      data: {
        templateType: type,
        campaignId: campaignId
      },
      token: this.Token
    }
    return this.http.post(ApiUrl + "Campaign/GetCampaignsMessageTemplates", request);
  }
  createCampaignMessageTemplate(request: any) {
    request.token = this.Token
    return this.http.post(ApiUrl + "Campaign/CreateCampaignMessageTemplate", request);
  }
  AddMessagetemplateFromCampain(id: number, request: any) {
    request.token = this.Token;
    return this.http.post(ApiUrl + "MessageTemplate/CreateMessageTemplateFromCampain?campainId=" + id, request);
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

  getMessageTemplateDetails() {
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

  getFacebookTokenByUser(userId: number) {
    return this.http.get<any>(`${ApiUrl}socialmedia/user-facebook-token/${userId}`);
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
GetTemplateById(payload: any): Observable<any> {
  debugger
  const token = this.Token // Get token from local storage

  if (!token) {
    console.error('Token is missing!');
    throw new Error('Token is missing');  // Ensure that if token is missing, it throws an error
  }

  const requestBody = {
    token: token,  // Include token from local storage
    data: payload.data  // Use the data passed from the onEventClick function
  };

  console.log('Request Body:', requestBody);  // Debugging to check request structure
  return this.http.post(ApiUrl + `Campaign/GetTemplateById`, requestBody);
}



}

