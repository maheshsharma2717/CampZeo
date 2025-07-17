import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
export interface TextGenerationRequest {
  prompt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TextGenerationService {

  private apiUrl = environment.API_BASE_URL + 'TextGeneration/GenerateText'; 

  constructor(private http: HttpClient) {}

  generateText(request: TextGenerationRequest): Observable<{ text: string }> {
    return this.http.post<{ text: string }>(this.apiUrl, request);
  }

  generateImageWithHorde(prompt: string): Observable<any> {
   
    const url = `${environment.API_BASE}Horde/Generate?prompt=${encodeURIComponent(prompt)}`;
    return this.http.get<any>(url);
  }

  editImageWithHorde(data: { prompt: string, base64Image: string, processingType: string }) {
    const url = environment.API_BASE +'Horde/Edit';
    return this.http.post<any>(url, {
      prompt: data.prompt,
      base64Image: data.base64Image,
      processingType: data.processingType
    }, {
      headers: { 'Content-Type': 'application/json-patch+json' }
    });
  }
  Edit(data: any) {
    const  apiUrl = environment.API_BASE_URL + 'Edit/Edit'; 
    
    return this.http.post<any>(apiUrl,data, {
      headers: { 'Content-Type': 'application/json-patch+json' }
    });
  }
}