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

  calendarFaded = false;

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
      case 7: return "linkedin";
      case 8: return "youtube";
      case 9: return "pinterest";
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
    linkedin: ["#0077b5", "#0091ea", "#00b0f4", "#00c853"],
    youtube: ["#ff0000", "#ff3333", "#ff6666", "#ff9999"],
    pinterest: ["#e60023", "#ff4060", "#ff7a98", "#ffb3c6"],
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
    if (campaign.isYouTubeCampaign) types.push("youtube");
    if (campaign.isPinterestCampaign) types.push("pinterest");
    return types.length ? types : ["other"];
  }

  getCampaignType(campaign: any): string {
    if (campaign.isFacebookCampaign) return "facebook";
    if (campaign.isInstagramCampaign) return "instagram";
    if (campaign.isEmailCampaign) return "email";
    if (campaign.isSmsCampaign) return "sms";
    if (campaign.isRCSCampaign) return "rcs";
    if (campaign.isWhatsAppCampaign) return "whatsapp";
    if (campaign.isYouTubeCampaign) return "youtube";
    if (campaign.isPinterestCampaign) return "pinterest";
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
      case "linkedin": return "#0077b5";
      case "youtube": return "#ff0000";
      case "pinterest": return "#e60023";
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
      case "linkedin": return "fab fa-linkedin-in";
      case "youtube": return "fab fa-youtube";
      case "pinterest": return "fab fa-pinterest";
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

    onBeforeEventRender: this.onBeforeEventRender.bind(this),
    onEventClick: this.onEventClick.bind(this),
  };

  viewDay(): void {
    debugger
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
    debugger;
  
    const selectedDate = args.start;
    if (selectedDate) {
      this.date = selectedDate;

      this.viewDay();

      this.configDay.startDate = selectedDate;
      this.configWeek.startDate = selectedDate;
      this.configMonth.startDate = selectedDate;

      this.loadScheduledPosts(selectedDate);

      if (this.day) {
        this.day.control.startDate = selectedDate;
        this.day.control.update();
      }


    }
    
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
      case 'youtube': return 8;
      case 'pinterest': return 9;
      default: return 0;
    }
  }

  changeDate(date: DayPilot.Date): void {
    this.configDay.startDate = date;
    this.configWeek.startDate = date;
    this.configMonth.startDate = date;
    this.loadScheduledPosts(date)

  }


  onBeforeEventRender(args: any) {
    let types: string[] = [];
    if (Array.isArray(args.data.tags?.type)) {
      types = args.data.tags.type;
    } else if (args.data.tags?.type) {
      types = [args.data.tags.type];
    }
    const iconHtml = types.map(type => `<i class="${this.getIconByType(type)}" style="font-size: 16px; background: rgba(66, 64, 64, 0.2); padding: 5px; border-radius: 4px;"></i>`).join(' ');
    const backColor = args.data.backColor;
    const textColor = "#ffffff";
    const name = args.data.text || "Campaign";
    const description = args.data.tags?.description || "";
    args.data.backColor = backColor;
    args.data.fontColor = textColor;
    const eventDate = args.data.start ? new DayPilot.Date(args.data.start).toString("yyyy-MM-dd") : null;
    const eventHour = args.data.start ? new DayPilot.Date(args.data.start).getHours() : null;
    let eventsOnSameDate :any[] = [];
    if (eventDate && Array.isArray(this.events)) {
      eventsOnSameDate = this.events.filter(ev => {
        const evDate = ev.start ? new DayPilot.Date(ev.start).toString("yyyy-MM-dd") : null;
        return evDate === eventDate;
      });
    }

    if (this.configNavigator.selectMode === 'Week' && eventsOnSameDate.length > 1) {
      const hoursSet = new Set(
        eventsOnSameDate.map(ev => ev.start ? new DayPilot.Date(ev.start).getHours() : null)
      );
      if (hoursSet.size === 1) {
        args.data.html = `
          <div style="
            display: flex;
          ">
            <span style="
              display: flex;
              align-items: center;
            ">
              ${iconHtml}
            </span>
          </div>
        `;
      } else {
        args.data.html = `
          <div style="
            display: flex; 
          ">
            <span style="
              display: flex;
              margin-right: 10px;
              color: #ffffff;
            ">
              ${iconHtml}
            </span>
            <div style="display: flex; flex-direction: column; justify-content: center;">
              <div style="
                font-weight: 600;
                color: ${textColor};
                font-size: 15px;
                letter-spacing: 0.2px;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 140px;
              ">${name}</div>
              <div style="
                font-size: 12px;
                color: #e6e6e6;
                opacity: 0.85;
                font-style: italic;
                letter-spacing: 0.1px;
              ">${eventDate}</div>
            </div>
          </div>
        `;
      }
    } else if (this.configNavigator.selectMode === 'Month') {
      args.data.html = `
        <div style="
          display: flex;
          align-items: center;
        ">
          <span style="
            display: flex;
            margin-right: 10px;
            color: #ffffff;
          ">
            ${iconHtml}
          </span>
          <div style="
            font-weight: 600;
            color: #ffffff;
            font-size: 15px;
            letter-spacing: 0.2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 120px;
          ">${name}</div>
        </div>
      `;
    } else {
      args.data.html = `
        <div style="
          display: flex; 
        ">
          <span style="
            display: flex;
            margin-right: 10px;
            color: #ffffff;
           ">
            ${iconHtml}
          </span>
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <div style="
              font-weight: 600;
              color: ${textColor};
              font-size: 15px;
              letter-spacing: 0.2px;
              margin-bottom: 2px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 140px;
            ">${name}</div>
            <div style="
              font-size: 12px;
              color: #e6e6e6;
              opacity: 0.85;
              font-style: italic;
              letter-spacing: 0.1px;
            ">${eventDate}</div>
          </div>
        </div>
      `;
    }
  }

  closeModal() {
    const modalElement = document.querySelector('#platformModal') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    this.isPreviewModalOpen = false;
    this.calendarFaded = false;
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

