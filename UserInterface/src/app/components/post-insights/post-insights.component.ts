import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-insights',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './post-insights.component.html',
  styleUrl: './post-insights.component.css'
})
// export class PostInsightsComponent implements OnInit {
//   postId: string = ''; // Post ID to fetch insights for
//   accessToken: string = ''; // Access token for the account
//   platform: string = 'facebook'; // Platform (facebook or instagram)
//   insights: any = null; // To store the insights data
//   errorMessage: string = ''; // To store error messages

//   constructor(private service: AppService) {}

//   ngOnInit(): void {}

//   // Function to fetch post insights
//   fetchPostInsights(): void {
//     if (this.postId && this.accessToken && this.platform) {
//       this.service.getPostInsights(this.postId, this.accessToken, this.platform).subscribe(
//         (data) => {
//           this.insights = data;
//           this.errorMessage = ''; // Clear any previous errors
//         },
//         (error) => {
//           this.errorMessage = 'Failed to fetch post insights.';
//           this.insights = null;
//         }
//       );
//     } else {
//       this.errorMessage = 'Please fill in all the fields.';
//       this.insights = null;
//     }
//   }
// }



export class PostInsightsComponent implements OnInit {
  posts: any[] = []; 
  selectedPostId: string = ''; 
  accessToken: string = ''; 
  platform: string = 'facebook'; 
  insights: any = null; 
  errorMessage: string = ''; 

  constructor(private service: AppService ) {}

  ngOnInit(): void {
    debugger;
    // Fetch all posts
    this.service.getSocialMediaPosts().subscribe({
      next: (data) => {
        this.posts = data; // Store the posts
  
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch posts.';
      }
    });
  }
  

  // Function to fetch post insights when the user selects a post
  fetchPostInsights(): void {
    debugger;
    if (this.selectedPostId && this.accessToken && this.platform) {
      this.service.getPostInsights(this.selectedPostId, this.accessToken, this.platform).subscribe({
        next: (data) => {
          this.insights = data;
          this.errorMessage = ''; 
        },
        error: (error) => {
          this.errorMessage = 'Failed to fetch post insights.';
          this.insights = null;
        }
      });
    } else {
      this.errorMessage = 'Please select a post and fill in the access token.';
      this.insights = null;
    }
  }
  
}