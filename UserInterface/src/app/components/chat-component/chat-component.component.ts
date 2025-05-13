import { Component } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-chat-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.component.html',
  styleUrl: './chat-component.component.css'
})
export class ChatComponentComponent {

  apiResponse: any[] = [];
  questionText: any;
  myMessage: any;
  downloadableText: any='';
  isShowDownload: boolean = false;
  constructor(public service: AppService) {

  }
  GetResponseFromAi() {
    this.myMessage = this.questionText;
    const prompt = ` input : ${this.questionText}
    
    
    data: ${this.service.promptData} 
    
    Need a relative response to this data accordingto input text ${this.isShowDownload?"as csv file with short description":""}`;
    const request = {
      data: prompt
    };

    this.service.TestPrompt(request).subscribe({
      next: (response: any) => {
        const result = JSON.parse(response.data);
        this.apiResponse = result.candidates[0].content.parts.filter((x: any) => x.text = x.text.replace(/\*\*/g, '<br>'));
        const textContent = result.candidates[0].content.parts
          .map((x: any) => x.text.replace(/\*\*/g, '<br>'))
          .join('\n');

        const matches = textContent.match(/```([^```]+)```/g);
        if (matches) {
          this.downloadableText = matches.map((match: any) => match.replace(/```/g, '').trim());
          this.apiResponse.splice(this.downloadableText)
        }

        this.questionText = '';
      }
    });
  }

  downloadFile(fileName: string, fileType: 'csv' | 'xlsx'): void {
    const data = this.downloadableText.map((line: any) => ({ text: line }));
    if (fileType === 'csv') {
      this.downloadCSV(data, fileName);
    } else if (fileType === 'xlsx') {
      this.downloadExcel(data, fileName);
    }
  }

  private downloadCSV(data: any[], fileName: string): void {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }

  private convertToCSV(data: any[]): string {
    const array = [Object.keys(data[0])].concat(data.map(item => Object.values(item)));
    return array.map(row => row.join(',')).join('\n');
  }

  private downloadExcel(data: any[], fileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}
