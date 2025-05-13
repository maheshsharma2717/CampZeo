// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class AuthService {

// //   constructor() { }
// // }
// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private fbAppId = '1308015943977582';
//   private redirectUri = 'http://localhost:4200/auth-callback';
//    constructor(private http: HttpClient, private router: Router) { }
//   getFbLoginUrl() {
//     const scope = 'pages_show_list,pages_manage_posts,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_content_publish';
//     return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${this.fbAppId}&redirect_uri=${this.redirectUri}&scope=${scope}`;
//   }

//   exchangeCodeForToken(code: string) {
//     return this.http.post('/api/socialmedia/exchange-token', code, {
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
