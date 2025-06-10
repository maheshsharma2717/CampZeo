import { Component, OnInit, ViewChild } from '@angular/core';
import { DayPilot, DayPilotCalendarComponent, DayPilotModule, DayPilotMonthComponent, DayPilotNavigatorComponent } from "@daypilot/daypilot-lite-angular";
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../services/app-service.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { QuillModule } from 'ngx-quill'
import { EmailEditorComponent, EmailEditorModule } from 'angular-email-editor';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DayPilotModule, RouterModule, FormsModule, CommonModule, ReactiveFormsModule, QuillModule, EmailEditorModule, NgxPaginationModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  editorIsReady: boolean = false;
  jsonValue: any;
  selectedEventData: any = null;
  isPreviewModalOpen = false;
  previewData: any = {};
  Campaigns: any[] = [];
  events: DayPilot.EventData[] = [];
  date = DayPilot.Date.today();
  type: number = 0
  smsPlatForm: string = '';
  filteredModalContentAll: any[] = [];
  showCampaignModal = false;
  emailHtml: string = '';
  currentStep = 1;
  campaignData: any = null;
  showNavigator: boolean = false;
  emailHtmlContent: string = '';
  @ViewChild(EmailEditorComponent) private emailEditor!: EmailEditorComponent;
  simpleText: string = '';
  videoUrl: string | ArrayBuffer | null = null;
  uploadedVideoUrl: string = '';
  blured = false;
  focused = false;
  editorContent: string = '';
  editMode: boolean = false;
  smsPlatform: any;
  id: any;
  //day pilot 
  static colors = {
    green: "#6aa84f",
    yellow: "#f1c232",
    red: "#cc4125",
    gray: "#808080",
    blue: "#2e78d6",
  };

  @ViewChild("day") day!: DayPilotCalendarComponent;
  @ViewChild("week") week!: DayPilotCalendarComponent;
  @ViewChild("month") month!: DayPilotMonthComponent;
  @ViewChild("navigator") nav!: DayPilotNavigatorComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private http: HttpClient,
    private service: AppService,
    private toaster: ToastrService,

  ) {
    this.viewWeek();

  }
  ngOnInit(): void {
    this.loadScheduledPosts(DayPilot.Date.now());
  }
  loadScheduledPosts(date: DayPilot.Date): void {
    this.service.GetScheduledPosts(date, this.configNavigator.selectMode).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          const posts = response.data;
          this.events = [];

          posts.forEach((post: any) => {
            const type = this.mapTemplateTypeToString(post.templateType);

            this.events.push({
              id: `${post.templateId}-${type}`,
              text: post.campaignName,
              start: post.scheduledPostTime,
              end: post.scheduledPostTime,
              backColor: this.getColorByType(type),
              tags: {
                type: type,
                campaignId: post.campaignId,
                message: post.message,
                icon: this.getIconByType(type)
              }
            });
          });
        } else {
          this.toaster.warning(response.message);
        }
      },
      error: () => {
        this.toaster.error("Failed to load scheduled posts.");
      }
    });
  }

  mapTemplateTypeToString(type: number): string {
    switch (type) {
      case 5: return "facebook";
      case 6: return "instagram";
      case 1: return "email";
      case 2: return "sms";
      case 3: return "whatsapp";
      case 4: return "rcs";
      default: return "other";
    }
  }

  private campaignTypeColorShades: { [type: string]: string[] } = {
    facebook: ["#2e78d6", "#4f90e3", "#6aa9f0", "#3a9cfd"],
    instagram: ["#ff6363", "#ff8080", "#ff9999", "#ffb3b3"],
    email: ["#1abc9c", "#48c9b0", "#76d7c4", "#76d7b2"],
    sms: ["#f1c232", "#f4d35e", "#f7e678", "#f7e656"],
    rcs: ["#cc4125", "#e05234", "#f0654a", "#f0653c"],
    whatsapp: ["#25D366", "#45e087", "#7fffd4", "#7fffc6"],
    other: ["#808080", "#a0a0a0"]
  };

  private campaignColorIndex: { [key: string]: string } = {};

  getColorByTypeAndId(type: string, campaignId: number): string {
    const shades = this.campaignTypeColorShades[type] || this.campaignTypeColorShades["other"];

    const key = `${type}-${campaignId}`;
    if (!this.campaignColorIndex[key]) {
      const count = Object.keys(this.campaignColorIndex).filter(k => k.startsWith(type)).length;
      const color = shades[count % shades.length];
      this.campaignColorIndex[key] = color;
    }

    return this.campaignColorIndex[key];
  }

  getAllCampaignTypes(campaign: any): string[] {
    const types: string[] = [];
    if (campaign.isFacebookCampaign) types.push("facebook");
    if (campaign.isInstagramCampaign) types.push("instagram");
    if (campaign.isEmailCampaign) types.push("email");
    if (campaign.isSmsCampaign) types.push("sms");
    if (campaign.isRCSCampaign) types.push("rcs");
    if (campaign.isWhatsAppCampaign) types.push("whatsapp");
    return types.length ? types : ["other"];
  }

  getCampaignType(campaign: any): string {
    if (campaign.isFacebookCampaign) return "facebook";
    if (campaign.isInstagramCampaign) return "instagram";
    if (campaign.isEmailCampaign) return "email";
    if (campaign.isSmsCampaign) return "sms";
    if (campaign.isRCSCampaign) return "rcs";
    if (campaign.isWhatsAppCampaign) return "whatsapp";
    return "other";
  }

  getColorByType(type: string): string {
    switch (type) {
      case "facebook": return "#2e78d6";
      case "instagram": return "#ff6363";
      case "email": return "#1abc9c";
      case "sms": return "#f1c232";
      case "rcs": return "#cc4125";
      case "whatsapp": return "#25D366";
      default: return "#808080";
    }
  }

  getIconByType(type: string): string {
    switch (type) {
      case "facebook": return "fab fa-facebook";
      case "instagram": return "fab fa-instagram";
      case "email": return "fa fa-envelope";
      case "sms": return "fa fa-comment";
      case "rcs": return "fa fa-comments";
      case "whatsapp": return "fab fa-whatsapp";
      default: return "fa fa-bullhorn";
    }
  }

  getColors(): any[] {
    return [
      { name: "Green", id: CalendarComponent.colors.green },
      { name: "Yellow", id: CalendarComponent.colors.yellow },
      { name: "Red", id: CalendarComponent.colors.red },
      { name: "Gray", id: CalendarComponent.colors.gray },
      { name: "Blue", id: CalendarComponent.colors.blue },
    ];
  }

  configNavigator: DayPilot.NavigatorConfig = {
    showMonths: 1,
    cellWidth: 25,
    cellHeight: 25,
  };


  configDay: DayPilot.CalendarConfig = {
    durationBarVisible: false,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this),
  };

  configWeek: DayPilot.CalendarConfig = {
    viewType: "Week",
    durationBarVisible: false,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this),
  };

  configMonth: DayPilot.MonthConfig = {
    eventBarVisible: false,
    onTimeRangeSelected: this.onTimeRangeSelected.bind(this),
    onEventClick: this.onEventClick.bind(this),
  };

  viewDay(): void {
    this.configNavigator.selectMode = "Day";
    this.configDay.visible = true;
    this.configWeek.visible = false;
    this.configMonth.visible = false;

  }

  viewWeek(): void {
    this.configNavigator.selectMode = "Week";
    this.configDay.visible = false;
    this.configWeek.visible = true;
    this.configMonth.visible = false;
  }

  viewMonth(): void {
    this.configNavigator.selectMode = "Month";
    this.configDay.visible = false;
    this.configWeek.visible = false;
    this.configMonth.visible = true;
  }

  async onTimeRangeSelected(args: any) {

  }

  formatDateTimeLocal(date: Date): string {
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async onEventClick(args: any) {
    debugger;
    const data = args.e.data;
    const [templateId, type] = data.id.split('-');
    const templateType = this.mapStringToTemplateType(type);

    const campaignId = parseInt(data.tags?.campaignId ?? "0");
    if (campaignId > 0) {
      const request = { data: campaignId };
      this.service.GetCampaignById(request).subscribe({
        next: (response: any) => {
          this.campaignData = response.data;
        },
        error: () => {
          this.toaster.error('Failed to fetch campaign details.');
        }
      });
    }

    this.service.GetTemplateById(parseInt(templateId)).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.previewData = response.data;
          this.editorContent = this.previewData.message;
          this.simpleText = this.previewData.message;

          if (response.data.type === 1) {
            const parts = this.previewData.message.split('[{(break)}]');
            if (parts.length > 1) {
              this.emailHtmlContent = parts[0];
              try {
                this.jsonValue = JSON.parse(parts[1]);
              } catch (error) {
                console.error('Error parsing design JSON:', error);
              }
            } else {
              this.emailHtmlContent = this.previewData.message;
            }
          }


          this.isPreviewModalOpen = true;
        } else {
          this.toaster.warning(response.message);
        }
      },
      error: () => {
        this.toaster.error('Failed to load template preview.');
      }
    });
  }
  mapStringToTemplateType(type: string): number {
    switch (type.toLowerCase()) {
      case 'email': return 1;
      case 'sms': return 2;
      case 'whatsapp': return 3;
      case 'rcs': return 4;
      case 'facebook': return 5;
      case 'instagram': return 6;
      case 'linkedin': return 7;
      default: return 0;
    }
  }

  changeDate(date: DayPilot.Date): void {
    this.configDay.startDate = date;
    this.configWeek.startDate = date;
    this.configMonth.startDate = date;
    this.loadScheduledPosts(date)

  }

  // Preview changes end 

  onBeforeEventRender(args: any) {
    const type = args.data.tags?.type;
    const iconClass = this.getIconByType(type);
    const backColor = args.data.backColor;
    const textColor = "#ffffff";

    const name = args.data.text || "Campaign";
    const description = args.data.tags?.description || "";

    args.data.backColor = backColor;
    args.data.fontColor = textColor;

    args.data.html = `
      <div style="display: flex; gap: 8px; align-items: center; padding: 5px;">
        <i class="${iconClass}" style="font-size: 16px; background: rgba(66, 64, 64, 0.2); padding: 5px; border-radius: 4px;"></i>
        <div style="display: flex; flex-direction: column;">
          <div style="font-weight: bold; color: ${textColor}; font-size: 14px;">${name}</div>
          <div style="font-size: 12px; color: ${textColor};">${description}</div>
        </div>
      </div>
    `;
  }

  closeModal() {
    const modalElement = document.querySelector('#platformModal') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
  GetHtml(message: any) {
    var html = message.split('[{(break)}]');
    return html[0];
  }

  onEditorReady(): void {
    this.editorIsReady = true;
    this.loadEditorDesign();
  }
  private loadEditorDesign(): void {
    if (this.editorIsReady && this.jsonValue && this.emailEditor?.editor?.loadDesign) {
      console.log('Loading design into editor...', this.jsonValue);
      this.emailEditor.editor.loadDesign(this.jsonValue);
    } else {
      console.log('Editor not ready or design missing.');
    }
  }
  toggleNavigator() {
    this.showNavigator = !this.showNavigator;
  }
  onNavigatorDateChange(date: DayPilot.Date): void {
    this.changeDate(date);
    this.showNavigator = false;
  }
}

