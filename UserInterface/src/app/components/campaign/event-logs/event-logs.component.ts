import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChatComponentComponent } from '../../chat-component/chat-component.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import {
  GridModule,
  PageService,
  SortService,
  ToolbarService,
} from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'app-event-logs',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ChatComponentComponent,
    NgxPaginationModule,
    FormsModule,
    GridModule,
  ],
  templateUrl: './event-logs.component.html',
  styleUrl: './event-logs.component.css',
  providers: [DatePipe, PageService, SortService, ToolbarService],
})
export class EventLogsComponent implements OnInit {
  logs: any[] = [];
  SelectedEmail: string = '';
  SelectedEvents: string[] = [];
  contacts: any[] = [];
  type: any;
  isPopupOpen: boolean = false;
  page: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 20, 100, 200, 1000];
  total: number = 0;
  pageSettings = { pageSize: 10, pageSizes: [5, 10, 20, 50] };
  toolBarOptions = ['Custom'];

  constructor(
    public service: AppService,
    private activatedRoutes: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoutes.queryParams.subscribe((param) => {
      this.type = param['type'];
      this.fetchLogs(param['type']);
    });
  }
  ngOnInit(): void {}

  fetchLogs(type: string): void {
    this.logs = [];
    switch (type) {
      case 'email': {
        var request = {
          data: {
            email: this.SelectedEmail,
            event: this.SelectedEvents,
          },
        };
        this.service.getLogs(request, 'CheckEmailLogs').subscribe({
          next: (response: any) => {
            var logs = response.data; // Assuming API returns an array of logs
            this.logs = logs.items;
            this.service.promptData = JSON.stringify(this.logs);
          },
        });
        break;
      }
      case 'SMS': {
        var request1 = {
          data: {},
        };
        this.service.getLogs(request1, 'CheckMessageLogs').subscribe({
          next: (response: any) => {
            var logs = response.data; // Assuming API returns an array of logs
            this.logs = logs
              .filter(
                (x: any) => !x.recipient.toLowerCase().includes('whatsapp:')
              )
              .filter((x: any) => !x.recipient.toLowerCase().includes('@'));
            this.service.promptData = JSON.stringify(this.logs);
          },
        });
        break;
      }
      case 'WhatsApp': {
        var request1 = {
          data: {},
        };
        this.service.getLogs(request1, 'CheckMessageLogs').subscribe({
          next: (response: any) => {
            debugger;
            var logs = response.data; // Assuming API returns an array of logs
            this.logs = logs.filter((x: any) =>
              x.recipient.toLowerCase().startsWith('whatsapp:')
            );
            this.service.promptData = JSON.stringify(this.logs);
          },
        });
        break;
      }
      case 'RCS': {
        var request1 = {
          data: {},
        };
        this.service.getLogs(request1, 'CheckRcsLogs').subscribe({
          next: (response: any) => {
            var logs = response.data;
            this.logs = logs.filter((x: any) => x.recipient.includes('RCS:'));
            this.service.promptData = JSON.stringify(this.logs);
          },
        });
        break;
      }
      default:
        break;
    }

    this.service.GetContacts().subscribe({
      next: (response: any) => {
        this.contacts = response.data;
      },
    });
  }
  convertToDate(decimalTimestamp: number): string {
    const date = new Date(decimalTimestamp * 1000);
    return date.toLocaleString();
  }
  ChangeType(QuerryParam: string) {
    this.router.navigate([], {
      queryParams: { type: QuerryParam },
      queryParamsHandling: 'merge',
    });
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }
  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }
}
