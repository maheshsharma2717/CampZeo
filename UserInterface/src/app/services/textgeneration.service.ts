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
}