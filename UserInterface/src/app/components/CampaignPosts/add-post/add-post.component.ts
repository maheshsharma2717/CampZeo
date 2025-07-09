import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmailEditorComponent, EmailEditorModule } from 'angular-email-editor';
import { QuillModule } from 'ngx-quill';
import { AppService } from '../../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { queryParams } from '@syncfusion/ej2-base';
import { TextGenerationService } from '../../../services/textgeneration.service';
import { ChatComponent } from './chat/chat.component';



@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmailEditorModule, CommonModule, QuillModule, RouterModule, ChatComponent],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {
  CampaignPostForm: any = new FormGroup({
    campaignId: new FormControl('', Validators.required),
    subject: new FormControl('', Validators.required),
    message: new FormControl(''),
    senderEmail: new FormControl('', [Validators.required, Validators.email]),
    scheduledPostTime: new FormControl('', Validators.required),
    type: new FormControl(0),
    html: new FormControl('')
  });
  campaigns: any[] = [];
  @ViewChild(EmailEditorComponent) private emailEditor!: EmailEditorComponent;
  @ViewChild('dateTimeInput') dateTimeInput!: ElementRef;
  simpleText: string = '';
  id: any;
  editMode: boolean = false;
  jsonValue: any;
  smsPlatform: any;
  blured = false
  focused = false
  editorContent: string = '';
  CampainIdFromTemplate: number = 0
  videoUrl: string | ArrayBuffer | null = null;
  uploadedVideoUrl: string = '';
  filteredCampaigns: any[] = [];
  campaignSearch = { name: '', startDate: '', endDate: '' };
  campaignInputValue = '';
  showCampaignDropdown = false;
  selectedFileName: string = '';
  generatingSubject = false;
  generatingContent = false;
  aiTitleOptions: string[] = [];
  aiContentOptions: string[] = [];
  aiContentFullResponse: string = '';
  hoveredTitle: string | null = null;
  hoveredContent: string | null = null;
  selectedTitleBadge: number | null = null;
  selectedContentOption: number | null = null;
  showContentAIPopover: boolean = false;
  showChatHelper: boolean = false;
  showAIContentModal: boolean = false;
  selectedChatText: string = '';
  showAddToContentButton: boolean = false;
  showAddToContentTooltip: boolean = false;
  private tooltipTimer: any = null;

  constructor(public service: AppService, private toaster: ToastrService, private activatedRoute: ActivatedRoute, private route: Router, private textGenService: TextGenerationService) {
    this.activatedRoute.queryParams.subscribe(param => {
      this.id = param['id']
      this.CampaignPostForm.patchValue({
        campaignId: param['campaignId']
      })
      if (this.id) {
        this.editMode = true
      } else {
        this.getCampaignPostDetails();
      }
      this.smsPlatform = param['type'];
    })
  }

  getCampaignPostDetails() {
    this.service.getCampaignPostDetails().subscribe((response: any) => {

      this.CampaignPostForm.patchValue({
        senderEmail: response.data.email,
        organisationName: response.data.name
      });

    })
  }

  ngOnInit(): void {
    if (this.id) {
      const request = { data: this.id };
      this.service.GetCampaignPostById(request).subscribe({
        next: (response: any) => {
          if (response?.data) {
            this.CampainIdFromTemplate = response.data.campaignId
            this.CampaignPostForm.patchValue(response.data);
            if (this.CampaignPostForm.get('type').value === 1) {
              const HtmlJson = response.data.message.split('[{(break)}]');
              if (HtmlJson.length > 1) {
                try {
                  this.jsonValue = JSON.parse(HtmlJson[1]);
                  if (this.emailEditor?.editor?.loadDesign) {
                    this.emailEditor.editor.loadDesign(this.jsonValue);
                  }
                } catch (error) {
                  console.error('Error parsing email content:', error);
                }
              }
            }
            else if (this.CampaignPostForm.get('type').value === 3) {
              this.editorContent = response.data.message;
            }
            else if (this.CampaignPostForm.get('type').value === 4) {
              this.editorContent = response.data.message;
            }
            else if (this.CampaignPostForm.get('type').value === 5) {
              this.editorContent = response.data.message;
            }
            else if (this.CampaignPostForm.get('type').value === 6) {
              this.editorContent = response.data.message;
              if (response.data.videoUrl) {
                this.videoUrl = response.data.videoUrl;
              }
            }
            else if (this.CampaignPostForm.get('type').value === 8) {
              this.editorContent = response.data.message;
              if (response.data.videoUrl) {
                this.videoUrl = response.data.videoUrl;
              }
            }
            else {
              this.simpleText = response.data.message;
            }
          } else {
            console.error('Invalid response data');
          }
        },
        error: (error) => {
          console.error('Error fetching message template:', error);
        }
      });
    }
    this.setFormTypeBasedOnPlatform();
    document.addEventListener('click', this.closeDropdownOnOutsideClick.bind(this));

  }
  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdownOnOutsideClick.bind(this));
  }

  closeDropdownOnOutsideClick(event: MouseEvent) {
    const section = document.getElementById('campaignSearchDiv');
    if (section && !section.contains(event.target as Node)) {
      this.showCampaignDropdown = false;
    }
  }
  onSubmit(): void {
    if (this.CampaignPostForm.valid) {
      this.GetMessagePromise()
        .then(() => {
          var templateData = this.CampaignPostForm.value;
          this.CampainIdFromTemplate = this.CampaignPostForm.value.campaignId;
          templateData.id = this.id ? this.id : 0;
          templateData.campainId = this.CampainIdFromTemplate;
          templateData.VideoUrl = this.uploadedVideoUrl;
          var request = { data: templateData };
          if (!this.smsPlatform) {
            this.service.AddCampaignPost(request).subscribe({
              next: (response: any) => {
                this.toaster.success(this.editMode ? "Updated successfully" : "Created successfully");
                this.route.navigate(['/list-campaign-posts'], {
                  queryParams: { campaignId: this.CampainIdFromTemplate }
                }); ``

              }
            })
          } else {
            request.data.isAttachedToCampaign = true;
            this.submitFromCampain(request)
          }
        })
        .catch((error) => {
          console.error('Error exporting HTML:', error);
        });
    } else {
      console.log('Form is invalid');
    }
  }

  selectCampaign(campaign: any) {
    if (campaign) {
      this.campaignSearch.name = campaign.name;
      this.CampaignPostForm.get('campaignId')?.setValue(campaign.id);
      this.showCampaignDropdown = false;
    }
  }

  submitFromCampain(request: any): void {
    let campaignId = localStorage.getItem("campainId")

    if (campaignId) {
      this.service.AddCampaignPostFromCampaign(parseInt(campaignId), request).subscribe({
        next: (response: any) => {
          this.toaster.success("Updated successfully");
          this.route.navigate(['/list-campaigns']);
        }
      })
    }
  }

  GetMessagePromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.CampaignPostForm.controls.type.value == 1) {
          this.emailEditor.editor.exportHtml((data: any) => {
            this.CampaignPostForm.patchValue({
              message: data.html + "[{(break)}]" + JSON.stringify(data.design)
            });
            resolve();
          });
        }
        else if (this.CampaignPostForm.controls.type.value == 3) {
          this.CampaignPostForm.patchValue({
            message: this.editorContent
          });
          resolve();
        }
        else if (this.CampaignPostForm.controls.type.value == 4) {
          this.CampaignPostForm.patchValue({
            message: this.editorContent
          });
          resolve();
        } else if (this.CampaignPostForm.controls.type.value == 5) {
          this.CampaignPostForm.patchValue({
            message: this.editorContent
          });
          resolve();
        } else if (this.CampaignPostForm.controls.type.value == 6) {
          this.CampaignPostForm.patchValue({
            message: this.editorContent
          });
          resolve();
        } else if (this.CampaignPostForm.controls.type.value == 7) {
          this.CampaignPostForm.patchValue({
            message: this.editorContent
          });
          resolve();
        } else if (this.CampaignPostForm.controls.type.value == 8) {
          this.CampaignPostForm.patchValue({
            message: this.editorContent
          });
          resolve();
        }
        else {
          this.CampaignPostForm.patchValue({
            message: this.simpleText
          });
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  editorLoaded(event: any) {
    console.log('editorLoaded');
  }

  editorReady(event: any) {
    console.log('editorReady');
  }

  exportHtml() {
    this.emailEditor.editor.exportHtml((data: any) =>
      console.log('exportHtml', data)
    );
  }
  ChangeType(type: number) {

    this.CampaignPostForm.patchValue({
      type: type
    })
    this.smsPlatform = '';
  }

  ngOnChanges() {
    this.setFormTypeBasedOnPlatform();
  }

  setFormTypeBasedOnPlatform() {
    if (this.smsPlatform === 'Email') {
      this.CampaignPostForm.patchValue({ type: 1 });
    } else if (this.smsPlatform === 'SMS') {
      this.CampaignPostForm.patchValue({ type: 2 });
    } else if (this.smsPlatform === 'WhatsApp') {
      this.CampaignPostForm.patchValue({ type: 3 });
    } else if (this.smsPlatform === 'RCS') {
      this.CampaignPostForm.patchValue({ type: 4 });
    } else if (this.smsPlatform === 'Facebook') {
      this.CampaignPostForm.patchValue({ type: 5 });
    } else if (this.smsPlatform === 'Instagram') {
      this.CampaignPostForm.patchValue({ type: 6 });
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

  onVideoSelected(event: Event): void {
    debugger;
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
        .catch((error: any) => {
          console.error('Video upload failed', error);
          this.toaster.error('Failed to upload video');
        });
    }
  }
  openDatePicker() {
    this.dateTimeInput.nativeElement.showPicker?.();
    this.dateTimeInput.nativeElement.focus();
  }

  getSelectedPlatformName(): string {
    const type = this.CampaignPostForm.get('type').value;
    switch (type) {
      case 1: return 'Email';
      case 2: return 'SMS';
      case 3: return 'WhatsApp';
      case 4: return 'RCS';
      case 5: return 'Facebook';
      case 6: return 'Instagram';
      case 7: return 'LinkedIn';
      case 8: return 'YouTube';
      case 9: return 'Pinterest';
      default: return 'Platform';
    }
  }

  generateSubjectWithAI() {
    this.generatingSubject = true;
    this.selectedTitleBadge = null;
    const platform = this.getSelectedPlatformName();
    const currentTitle = this.CampaignPostForm.get('subject').value || '';
    const prompt = `Enhance the following ${platform} campaign post title with catchy look and feel  sentence. Respond ONLY with the improved title, no extra text, explanations, or formatting.\nTitle: ${currentTitle}`;

    this.textGenService.generateText({ prompt }).subscribe({
      next: (res: any) => {
        let responseObj = res;
        let text = '';
        if (Array.isArray(responseObj.response)) {
          text = responseObj.response.join('\n');
        } else if (typeof responseObj.response === 'string') {
          text = responseObj.response;
        } else {
          text = '';
        }
        this.CampaignPostForm.get('subject').setValue(text);
        this.generatingSubject = false;
      },
      error: () => { this.generatingSubject = false; }
    });
  }

  stripOptionPrefix(str: string): string {
    return str;
  }

  selectAiTitleOption(option: string, index: number) {
    this.CampaignPostForm.get('subject').setValue(option);
    this.selectedTitleBadge = index;
  }


  selectAiContentOption(option: string, index: number) {
    const cleanOption = this.stripOptionPrefix(option);
    const type = this.CampaignPostForm.get('type').value;
    if (type === 1 && this.emailEditor && this.emailEditor.editor) {
      try {
        const design = JSON.parse(cleanOption);
        this.emailEditor.editor.loadDesign(design);
        this.CampaignPostForm.patchValue({ message: cleanOption });
      } catch {
        this.CampaignPostForm.patchValue({ message: cleanOption });
      }
    } else if (type === 2 || type === 3) {
      this.simpleText = cleanOption;
      this.CampaignPostForm.patchValue({ message: cleanOption });
    } else {
      this.editorContent = cleanOption;
      this.CampaignPostForm.patchValue({ message: cleanOption });
    }
    this.selectedContentOption = index;
  }

  onChatContentGenerated(content: string) {
    // This is for direct content insertion (old logic)
    const type = this.CampaignPostForm.get('type').value;
    if (type === 1 && this.emailEditor && this.emailEditor.editor) {
      try {
        const design = JSON.parse(content);
        this.emailEditor.editor.loadDesign(design);
        this.CampaignPostForm.patchValue({ message: content });
      } catch {
        this.CampaignPostForm.patchValue({ message: content });
      }
    } else if (type === 2 || type === 3) {
      this.simpleText = content;
      this.CampaignPostForm.patchValue({ message: content });
    } else {
      this.editorContent = content;
      this.CampaignPostForm.patchValue({ message: content });
    }
  }

  onAIContentSelected(content: string) {
    // This is for direct content insertion (old logic)
    const type = this.CampaignPostForm.get('type').value;
    if (type === 1 && this.emailEditor && this.emailEditor.editor) {
      try {
        const design = JSON.parse(content);
        this.emailEditor.editor.loadDesign(design);
        this.CampaignPostForm.patchValue({ message: content });
      } catch {
        this.CampaignPostForm.patchValue({ message: content });
      }
    } else if (type === 2 || type === 3) {
      this.simpleText = content;
      this.CampaignPostForm.patchValue({ message: content });
    } else {
      this.editorContent = content;
      this.CampaignPostForm.patchValue({ message: content });
    }
    this.closeAIContentModal();
  }

  onChatTextSelected(selected: string) {
    this.selectedChatText = selected;
    this.showAddToContentButton = !!selected;
  }

  addSelectedChatTextToContent() {
    if (!this.selectedChatText) return;
    const type = this.CampaignPostForm.get('type').value;
    if (type === 1 && this.emailEditor && this.emailEditor.editor) {
      this.CampaignPostForm.patchValue({ message: (this.CampaignPostForm.get('message').value || '') + this.selectedChatText });
    } else if (type === 2 || type === 3) {
      this.simpleText = (this.simpleText || '') + this.selectedChatText;
      this.CampaignPostForm.patchValue({ message: this.simpleText });
    } else {
      this.editorContent = (this.editorContent || '') + this.selectedChatText;
      this.CampaignPostForm.patchValue({ message: this.editorContent });
    }
    this.selectedChatText = '';
    this.showAddToContentButton = false;
  }

  showTooltip() {
    this.showAddToContentTooltip = true;
  }
  hideTooltip() {
    this.showAddToContentTooltip = false;
  }

  onContentInputBlur() {
    setTimeout(() => { this.showContentAIPopover = false; this.showChatHelper = false; }, 200); 
  }
  onContentInputChange() {
    if (this.simpleText) {
      this.showContentAIPopover = false;
      this.showChatHelper = false;
    }
  }

  openAIContentModal() {
    this.showAIContentModal = true;
  }

  closeAIContentModal() {
    this.showAIContentModal = false;
  }

  startTooltipTimer() {
    this.clearTooltipTimer();
    this.tooltipTimer = setTimeout(() => {
      this.showAddToContentTooltip = true;
    }, 2000);
  }

  clearTooltipTimer() {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    this.showAddToContentTooltip = false;
  }

  showTooltipImmediate() {
    this.clearTooltipTimer();
    this.showAddToContentTooltip = true;
  }

}
