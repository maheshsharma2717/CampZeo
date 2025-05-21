
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
  // for preview
  jsonValue: any;
  selectedEventData: any = null;
  isPreviewModalOpen = false;
  previewData: any = {};
  //

  Campaigns: any[] = [];
  events: DayPilot.EventData[] = [];
  date = DayPilot.Date.today();
  type: number = 0
  smsPlatForm: string = '';
  filteredModalContentAll: any[] = [];
  showCampaignModal = false;
  emailHtml: string = '';
  currentStep = 1;
  //selectedTemplateId: string;

  //for showing the campaign type step 1 on the step 3
  messageTemplatesByType: { [key: string]: any } = {};
  messageTemplates: any[] = [];
  emailEditorHtml: string = '';
  templateDataMap: { [key: number]: any } = {};
  selectedTemplateTypeId: number = 0;
  //for showing the campaign type step 1 on the step 3 close
  selectedTimeRange: any;
 campaignForm: any = new FormGroup({
  name: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern('^[a-zA-Z ]+$')
  ]),
  description: new FormControl(''),
  startDate: new FormControl('', Validators.required),
  endDate: new FormControl('', Validators.required), 
  isEmailCampaign: new FormControl(false),
  isWhatsAppCampaign: new FormControl(false),
  isRCSCampaign: new FormControl(false),
  isSmsCampaign: new FormControl(false),
  isFacebookCampaign: new FormControl(false),
  isInstagramCampaign: new FormControl(false),

  subject: new FormControl('', Validators.required),
  message: new FormControl(''),
  senderEmail: new FormControl('', [Validators.required, Validators.email]),
  organisationName: new FormControl('', [Validators.required]),
  type: new FormControl(),
  html: new FormControl(''),
  scheduledPostTime: new FormControl('', Validators.required),
}, { validators: this.atLeastOneSelectedValidator });
  atLeastOneSelectedValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const emailSelected = control.get('isEmailCampaign')?.value;
    const smsSelected = control.get('isSmsCampaign')?.value;
    const whatsappSelected = control.get('isWhatsAppCampaign')?.value;
    const rcsSelected = control.get('isRCSCampaign')?.value;
    const facebookSelected = control.get('isFacebookCampaign')?.value;
    const instagramSelected = control.get('isInstagramCampaign')?.value;
    return (emailSelected || smsSelected || whatsappSelected || rcsSelected || facebookSelected || instagramSelected) ? null : { 'atLeastOneRequired': true };
  }

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

  //FOR SINGLE TYPE IN STEP THREE 
  selectedTemplateType: number | null = null;
  selectedTemplateId: number = 0;
  selectTemplate(item: any) {
    
    this.selectedTemplateId = item.id;
    this.selectedTemplateType = item.type;
  }
  //

  @ViewChild("day") day!: DayPilotCalendarComponent;
  @ViewChild("week") week!: DayPilotCalendarComponent;
  @ViewChild("month") month!: DayPilotMonthComponent;
  @ViewChild("navigator") nav!: DayPilotNavigatorComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private http: HttpClient,
    private service: AppService,
    private toaster: ToastrService
  ) {
    this.viewWeek();

  }
  getMessageTemplateDetails() {
    this.service.getCampaignPostDetails().subscribe((response: any) => {
      
      if (this.campaignForm) {
        this.campaignForm.patchValue({
          senderEmail: response.data?.email || '',
          organisationName: response.data?.name || ''
        });
      } else {
        console.error("MessageTemplateForm not initialized");
      }
    })
  }
  ngOnInit(): void {
    this.initializeComponentData();
    this.loadScheduledPosts(DayPilot.Date.now());
  }
  loadScheduledPosts(date: DayPilot.Date): void {
    this.service.GetScheduledPosts(date,this.configNavigator.selectMode).subscribe({
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
      case "facebook": return "fab fa-facebook-f";
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
    showMonths: 3,
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
    this.selectedTimeRange = args;
    const start = this.formatDateTimeLocal(args.start);
    const end = this.formatDateTimeLocal(args.end);

    this.campaignForm.patchValue({
      startDate: start,
      endDate: end
    });

    this.showCampaignModal = true;
    this.currentStep = 1;
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

  // Preview changes
  async onEventClick(args: any) {
    debugger
    const data = args.e.data;

    const [templateId, type] = data.id.split('-');
    const templateType = this.mapStringToTemplateType(type);

    this.service.GetTemplateById(parseInt(templateId)).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.previewData = response.data;
          this.editorContent = this.previewData.message;
           this.simpleText = this.previewData.message;
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
  openTemplatePreview(data: any) {
    this.selectedEventData = data;
    this.isPreviewModalOpen = true;

    // Patch data into form
    this.campaignForm.patchValue({
      subject: data.subject || '',
      organisationName: data.organisationName || '',
      senderEmail: data.senderEmail || '',
      scheduledPostTime: this.formatTime(data.scheduledPostTime),
      type: data.type || 0
    });

    this.editorContent = data.message || '';
    this.simpleText = data.message || '';
    this.videoUrl = data.videoUrl || null;
  }
  formatTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toTimeString().slice(0, 5);
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


  // Close modal
  closeCampaignModal() {
    this.showCampaignModal = false;
    this.campaignForm.reset();
  }


  proceedToNextSlide() {
    const campaignData = this.campaignForm.value;

    this.toaster.success("Campaign form filled. Proceeding...");

    const dp = this.selectedTimeRange.control;
    dp.clearSelection();

    dp.events.add(new DayPilot.Event({
      start: this.selectedTimeRange.start,
      end: this.selectedTimeRange.end,
      id: DayPilot.guid(),
      text: campaignData.name
    }));

  }

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  proceedToAddTemplate() {
    
    this.currentStep = 3;
    this.campaignForm.controls['type'].setValue(this.selectedTemplateType || 1);

    this.getMessageTemplateDetails();

  }

  proceedToNextStep() {
    if (this.currentStep === 2 && this.selectedTemplateType) {
      this.campaignForm.controls['type'].setValue(this.selectedTemplateType);
    }
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  resetModal() {
    this.currentStep = 1;
    this.campaignForm.reset();
    //  this.selectedTemplateId = 0;
    this.showCampaignModal = false;
  }

  // popup add template 
  editorLoaded(event: any) {
    console.log('editorLoaded');
  }

  editorReady(event: any) {
    console.log('editorReady');
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.videoUrl = reader.result;
      };
      reader.readAsDataURL(file);

      this.service.uploadMediaFile(file)
        .then((response: any) => {
          this.uploadedVideoUrl = response.url;
          this.toaster.success('Video uploaded successfully!');
        })
        .catch((error) => {
          console.error('Video upload failed', error);
          this.toaster.error('Failed to upload video');
        });
    }
  }
  created(event: any) {
    console.log(event)
  }

  focus($event: any) {
    console.log('focus', $event)
    this.focused = true
    this.blured = false
  }

  blur($event: any) {
    console.log('blur', $event)
    this.focused = false
    this.blured = true
  }

  ChangeType(typeId: number) {
    
    if (this.selectedTemplateTypeId) {
      this.templateDataMap[this.selectedTemplateTypeId] = {
        form: this.campaignForm.value,
        editorContent: this.editorContent,
        simpleText: this.simpleText,
        videoUrl: this.uploadedVideoUrl,
      };
    }

    this.selectedTemplateTypeId = typeId;
    this.campaignForm.get('type')?.setValue(typeId);
  }

  //  USED FOR THE ONE TYPE SELECTION ON THE STEP ONE 
  campaignTypes = [
    { id: 1, name: 'Email', formKey: 'isEmailCampaign', icon: 'fas fa-envelope-open' },
    { id: 2, name: 'SMS', formKey: 'isSmsCampaign', icon: 'fas fa-sms' },
    { id: 3, name: 'WhatsApp', formKey: 'isWhatsAppCampaign', icon: 'fab fa-whatsapp' },
    { id: 4, name: 'RCS', formKey: 'isRCSCampaign', icon: 'fa fa-globe' },
    { id: 5, name: 'Facebook', formKey: 'isFacebookCampaign', icon: 'fab fa-facebook' },
    { id: 6, name: 'Instagram', formKey: 'isInstagramCampaign', icon: 'fab fa-instagram' },
  ];
  get selectedCampaignTypes(): { id: number, name: string, formKey: string, icon: string }[] {
    return this.campaignTypes.filter(campaign => this.campaignForm.get(campaign.formKey)?.value);
  }
  toggleSelection(controlName: string): void {
    const campaignControls = [
      'isEmailCampaign',
      'isSmsCampaign',
      'isWhatsAppCampaign',
      'isRCSCampaign',
      'isFacebookCampaign',
      'isInstagramCampaign'
    ];

    campaignControls.forEach(name => {
      this.campaignForm.get(name)?.setValue(name === controlName);
    });

    this.campaignForm.updateValueAndValidity();
  }


  openTemplateSelection(platform: string) {
    this.smsPlatform = platform;
  }
  getIconClass(type: string): string {
    switch (type) {
      case 'Email': return 'fas fa-envelope-open';
      case 'SMS': return 'fas fa-sms';
      case 'WhatsApp': return 'fab fa-whatsapp';
      case 'RCS': return 'fa fa-globe';
      case 'Facebook': return 'fab fa-facebook';
      case 'Instagram': return 'fab fa-instagram';
      default: return 'fa fa-circle';
    }
  }
  editorRef: any;
  editorHtml: string = '';

  saveCampaign() {
    this.campaignForm.markAllAsTouched();

    if (this.campaignForm.valid) {
      const formData = this.campaignForm.value;
      const messageTemplates: any[] = [];
      const typeId = formData.type;

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      const [scheduledHour, scheduledMinute] = formData.scheduledPostTime.split(':').map((part: string) => parseInt(part, 10));

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const postDate = new Date(d);
        postDate.setHours(scheduledHour);
        postDate.setMinutes(scheduledMinute);
        postDate.setSeconds(0);
        postDate.setMilliseconds(0);

        const baseTemplate = {
          type: typeId,
          subject: formData.subject,
          senderEmail: formData.senderEmail,
          organisationName: formData.organisationName,
          scheduledPostTime: this.formatDateTimeLocal(postDate),
        };

        if (typeId === 1) {
          (baseTemplate as any)['message'] = this.editorHtml || '';
        } else if (typeId === 2 || typeId === 3) {
          (baseTemplate as any)['message'] = this.simpleText || '';
        } else if (typeId === 4 || typeId === 5 || typeId === 6) {
          (baseTemplate as any)['message'] = this.editorContent || '';
          (baseTemplate as any)['videoUrl'] = this.uploadedVideoUrl || null;
        }

        messageTemplates.push({ ...baseTemplate });
      }

      const payload = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        isEmailCampaign: formData.isEmailCampaign,
        isSmsCampaign: formData.isSmsCampaign,
        isWhatsAppCampaign: formData.isWhatsAppCampaign,
        isInstagramCampaign: formData.isInstagramCampaign,
        isFacebookCampaign: formData.isFacebookCampaign,
        isRCSCampaign: formData.isRCSCampaign,
        campaignMessageTemplates: messageTemplates
      };

      this.service.saveCampaignWithTemplates(payload).subscribe({
        next: () => {
          this.toaster.success('Campaign saved successfully');
          this.closeCampaignModal();
          this.loadScheduledPosts(DayPilot.Date.now());
        },
        error: (err) => {
          this.toaster.error('Error saving campaign');
          console.error(err);
        }
      });
    }
  }


  getTypeNameById(typeId: number): string {
    const campaign = this.campaignTypes.find(c => c.id === typeId);
    return campaign ? campaign.name : 'Unknown';
  }

  exportHtml() {
    this.emailEditor.editor.exportHtml((data: any) => {
      this.emailHtml = data.html + "[{(break)}]" + JSON.stringify(data.design);
    });
  }

  getFinalMessageContent(formData: any): string {
    if (this.editorContent?.trim()) {
      return this.editorContent;
    } else if (this.emailEditorHtml?.trim()) {
      return this.emailEditorHtml;
    } else if (this.simpleText?.trim()) {
      return this.simpleText;
    } else if (formData?.messageContent?.trim()) {
      return formData.messageContent;
    } else {
      return '';
    }
  }


  //added the contact for the sms rcs email and whatsapp 
  allSelected: boolean = false;
  contacts: any[] = [];
  filteredContacts: any[] = [];
  page: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 20, 100, 200, 1000];
  total: number = 0;
  accessToken: string = localStorage.getItem('access_token') || '';
  pages: any[] = [];
  campagin:any;
   messageTemplate: any;
    searchTerm: string = '';
  selectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allSelected = isChecked;
    this.contacts.forEach(contact => {
      contact.selected = isChecked;
    });
  }
  onIndividualCheckChange() {
    this.allSelected = this.contacts.every(contact => contact.selected);
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }
  initializeComponentData(): void {
    this.GetAllContacts();

    if (this.accessToken) {
      this.service.getFacebookPages(this.accessToken).subscribe({
        next: (res: any) => {
          this.pages = res.data || [];
        },
        error: err => {
          console.error('Failed to load pages:', err);
        }
      });
    }
  }
  GetAllContacts() {
    
    this.service.GetEventForCampaignPost({ data: this.id }).subscribe({
      next: (response: any) => {
        this.contacts = response.data.contact
        this.campagin=response.data.campaign
        this.messageTemplate = response.data.campaignMessageTemplate
        this.filteredContacts = this.contacts
        this.total = this.contacts.length;
        this.videoUrl = this.messageTemplate?.instagramTemplate?.videoUrl || '';
        
      //  this.setActiveTab();
      }
    })
  }
  
   onSearchChange(): void {
    if (this.searchTerm) {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.contactName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.contactMobile.includes(this.searchTerm) ||
        contact.contactWhatsApp.includes(this.searchTerm)
      );
    } else {
      this.filteredContacts = this.contacts;
    }
    this.total = this.filteredContacts.length;
    this.page = 1;
  }
  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }

  // validation

// nextStep() {
//   
//   if (this.currentStep === 1) {
//     this.campaignForm.get('name')?.markAsTouched();
//     this.campaignForm.get('startDate')?.markAsTouched();
//     this.campaignForm.get('endDate')?.markAsTouched();
//     this.campaignForm.updateValueAndValidity(); 

//     if (this.campaignForm.invalid) return;
//   }

//   if (this.currentStep === 3) {
//     this.campaignForm.get('subject')?.markAsTouched();
//     this.campaignForm.get('senderEmail')?.markAsTouched();
//     this.campaignForm.get('organisationName')?.markAsTouched();
//     this.campaignForm.get('scheduledPostTime')?.markAsTouched();

//     if (this.campaignForm.get('subject')?.invalid ||
//         this.campaignForm.get('senderEmail')?.invalid ||
//         this.campaignForm.get('organisationName')?.invalid ||
//         this.campaignForm.get('scheduledPostTime')?.invalid) {
//       return;
//     }
//   }

//   // Proceed to the next step
//   this.currentStep++;
// }

nextStep() {
  if (this.currentStep === 1) {
    this.campaignForm.get('name')?.markAsTouched();
    this.campaignForm.get('startDate')?.markAsTouched();
    this.campaignForm.get('endDate')?.markAsTouched();
    this.campaignForm.updateValueAndValidity();

    const invalidFields: string[] = [];

    if (this.campaignForm.get('name')?.invalid) {
      invalidFields.push('Name');
    }
    if (this.campaignForm.get('startDate')?.invalid) {
      invalidFields.push('Start Date');
    }
    if (this.campaignForm.get('endDate')?.invalid) {
      invalidFields.push('End Date');
    }
    if (this.campaignForm.errors?.atLeastOneRequired) {
      invalidFields.push('Campaign Type');
    }

    if (invalidFields.length > 0) {
      this.toaster.error(`Please fix the following fields: ${invalidFields.join(', ')}`, 'Validation Error');
      console.log('Invalid Fields:', invalidFields);
      return;
    }
  }

  if (this.currentStep === 3) {
    this.campaignForm.get('subject')?.markAsTouched();
    this.campaignForm.get('senderEmail')?.markAsTouched();
    this.campaignForm.get('organisationName')?.markAsTouched();
    this.campaignForm.get('scheduledPostTime')?.markAsTouched();

    const invalidFields: string[] = [];

    if (this.campaignForm.get('subject')?.invalid) {
      invalidFields.push('Subject');
    }
    if (this.campaignForm.get('senderEmail')?.invalid) {
      invalidFields.push('Sender Email');
    }
    if (this.campaignForm.get('organisationName')?.invalid) {
      invalidFields.push('Organisation Name');
    }
    if (this.campaignForm.get('scheduledPostTime')?.invalid) {
      invalidFields.push('Scheduled Post Time');
    }

    if (invalidFields.length > 0) {
      this.toaster.error(`Please fix the following fields: ${invalidFields.join(', ')}`, 'Validation Error');
      console.log('Invalid Fields:', invalidFields);
      return;
    }
  }

  this.currentStep++;
}


}

