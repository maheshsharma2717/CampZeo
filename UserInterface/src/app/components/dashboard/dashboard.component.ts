import { Component, NgModule, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SidebarComponent } from "../../layout/sidebar/sidebar.component";
import { TopbarComponent } from "../../layout/topbar/topbar.component";
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ChangePasswordDialogComponent } from '../../change-password-dialog/change-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PopupOpenEventArgs, ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { ScheduleComponent, DayService, WeekService, WorkWeekService, MonthService, AgendaService } from '@syncfusion/ej2-angular-schedule';
import { AppService } from '../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { EmailEditorComponent, EmailEditorModule } from 'angular-email-editor';
import { QuillModule } from 'ngx-quill';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, RouterOutlet, FormsModule, CommonModule,
    ScheduleModule, EmailEditorModule, ReactiveFormsModule, QuillModule, CalendarComponent],
  providers: [
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  constructor(private dialog: MatDialog, private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient, private service: AppService, private toaster: ToastrService, private route: Router) { }

  ngOnInit(): void {
    const isFirstLogin = localStorage.getItem('IsFirstLogin') === 'true';
    const isDialogShown = sessionStorage.getItem('FirstLoginDialogShown') === 'true';
    const userRole = Number(localStorage.getItem('UserRole'));
    if (isFirstLogin && userRole !== 1) {
      this.dialog.open(ChangePasswordDialogComponent, {
        disableClose: true,
        width: '400px',
      });

      sessionStorage.setItem('FirstLoginDialogShown', 'true');
    }
  }
}