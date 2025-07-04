import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../services/app-service.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css'
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  errorMessage = '';
  constructor( private route: ActivatedRoute, private router: Router, private http: HttpClient,public service: AppService ) {}

  ngOnInit(): void {
    
    const code = this.route.snapshot.queryParamMap.get('code');
    const platform = this.route.snapshot.queryParamMap.get('state') || 'facebook';
    const userId = this.service.User.id;
  
    if (!code) {
      this.loading = false;
      this.errorMessage = 'No authorization code found.';
      return;
    }
  
    this.service.exchangeToken(code, userId, platform).subscribe({
      next: (res: any) => {
        console.log(`${platform} Token:`, res);
  
        if (platform === 'instagram') {
          localStorage.setItem('insta_access_token', res.accessToken);
          localStorage.setItem('insta_connected', 'true');
        } else if(platform === 'facebook') {
          localStorage.setItem('access_token', res.accessToken);
          localStorage.setItem('fb_connected', 'true');
        
        } else if(platform === 'linkedIn') {
          localStorage.setItem('linkedIn_access_token', res.accessToken);
          localStorage.setItem('linkedIn_connected', 'true');
        }
        this.router.navigate(['/accounts']);
      },
      error: (err: any) => {
        console.error(`${platform} token exchange failed:`, err.statusCode || err.status);
        console.error(`${platform} token exchange failed:`, err.response || err.message);
      }
    });
  }
  
}
