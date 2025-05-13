import { Component } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-list-message-template',
  standalone: true,
  imports: [RouterModule, NgxPaginationModule, CommonModule, FormsModule],
  templateUrl: './list-message-template.component.html',
  styleUrl: './list-message-template.component.css'
})
export class ListMessageTemplateComponent {
  MessageTemplates: any[] = [];
  filteredModalContentAll: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 20, 100, 200, 1000];
  total: number = 0;
  constructor(private toastr: ToastrService, private service: AppService) {

  }
  typeMapping: { [key: number]: string } = {
    1: 'Email',
    2: 'SMS',
    3: 'WhatsApp',
    4: 'RCS',
    5:'Facebook',
    6:'Instagram'
  };

  ngOnInit(): void {
    debugger;
    this.service.GetMessageTemplates().subscribe({
      next: (response: any) => {
        this.MessageTemplates = response.data;
        this.filteredModalContentAll = [...this.MessageTemplates];
        this.total = this.MessageTemplates.length;
        if (response.isSuccess) {
          // this.toastr.success(response.message)
          this.toastr.success('Message Templates loaded successfully')
          }
          else{
            this.toastr.warning(response.message)
          }
      }
    });
  }

  GetHtml(message: any) {
    var html = message.split('[{(break)}]');
    return html[0];
  }

  UpdateLocalStorage() {
    localStorage.setItem("campainId", "0")
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }

  onSearchChange(): void {
    const searchTerm = this.searchTerm.trim().toLowerCase();

    if (searchTerm) {
      this.MessageTemplates = this.filteredModalContentAll.filter((messageTemplate) => {
        const subject = messageTemplate.subject?.toLowerCase() || '';
        const message = messageTemplate.message?.toLowerCase() || '';
        const senderEmail = messageTemplate.senderEmail?.toLowerCase() || '';
        const organisationName = messageTemplate.organisationName?.toLowerCase() || '';
        const type = this.typeMapping[messageTemplate.type]?.toLowerCase() || '';

        return (
          subject.includes(searchTerm) ||
          message.includes(searchTerm) ||
          senderEmail.includes(searchTerm) ||
          organisationName.includes(searchTerm) ||
          type.includes(searchTerm)
        );
      });
    } else {
      this.MessageTemplates = [...this.filteredModalContentAll];
    }

    this.total = this.MessageTemplates.length;
    this.page = 1;
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }
}
