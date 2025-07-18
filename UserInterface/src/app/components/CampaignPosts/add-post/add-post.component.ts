import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmailEditorComponent, EmailEditorModule } from 'angular-email-editor';
import { QuillModule } from 'ngx-quill';
import { AppService } from '../../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { TextGenerationService } from '../../../services/textgeneration.service';
import { ChatComponent } from './chat/chat.component';
import { ImageEditorSharedModule } from './image-editor.module';
import { ImageEditorComponent } from '@syncfusion/ej2-angular-image-editor';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EmailEditorModule,
    QuillModule,
    ChatComponent,
    ImageEditorSharedModule
  ],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent implements AfterViewInit {
  CampaignPostForm: any = new FormGroup({
    campaignId: new FormControl('', Validators.required),
    subject: new FormControl('', Validators.required),
    message: new FormControl(''),
    senderEmail: new FormControl('', [Validators.required, Validators.email]),
    scheduledPostTime: new FormControl('', Validators.required),
    type: new FormControl(null, Validators.required),
    html: new FormControl('')
  });
  campaigns: any[] = [];
  @ViewChild(EmailEditorComponent) private emailEditor!: EmailEditorComponent;
  @ViewChild('dateTimeInput') dateTimeInput!: ElementRef;
  @ViewChild('imageEditor') imageEditor!: ImageEditorComponent;
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
  attemptedSubmit: boolean = false;
  private tooltipTimer: any = null;
  selectedFileType: 'image' | 'video' | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  emailEditorReady = false;
  pendingEmailDesign: any = null;

  public imageEditorSettings: any = {
    width: '100%',
    height: '500px',
    toolbar: ['Undo', 'Redo', 'ZoomIn', 'ZoomOut', 'Pan', 'Crop', 'Transform', 'Annotate', 'Filter', 'Finetune', 'Shape', 'Frame', 'Text', 'Pen', 'Eraser']
  };

  showAIImageModal: boolean = false;
  aiImagePrompt: string = '';
  aiImageLoading: boolean = false;
  aiImageError: string | null = null;
  aiImageResultUrl: string | null = null;
  aiImageResults: string[] = [];
  selectedAIImageIndex: number | null = null;

  showAIEditModal: boolean = false;
  aiEditPrompt: string = '';
  aiEditProcessingType: string = 'img2img';
  aiEditLoading: boolean = false;
  aiEditError: string | null = null;
  aiEditResultUrl: string | null = null;

  showManualEditorModal: boolean = false;
  editorLoading: boolean = false;
  manualEditorImageUrl: string | null = null;

  showTestAIPayloadModal: boolean = false;
  testAIPayloadImage: string | null = null;
  testAIPayloadPrompt: string = '';
  pinterestFile: any;
  uploadedImageUrl: any;


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
    this.CampaignPostForm.get('message').valueChanges.subscribe((val: string) => {
      if (val !== this.simpleText) {
        this.simpleText = val;
      }
    });
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
            this.simpleText = response.data.message;
            this.CampaignPostForm.get('message').setValue(response.data.message);
            this.editorContent = response.data.message;
            if (this.CampaignPostForm.get('type').value === 1) {
              const HtmlJson = response.data.message.split('[{(break)}]');
              let designToLoad = null;
              if (HtmlJson.length > 1) {
                try {
                  this.jsonValue = JSON.parse(HtmlJson[1]);
                  designToLoad = this.jsonValue;
                } catch (error) {
                  console.error('Error parsing email content:', error);
                }
              } else {
                designToLoad = {
                  body: {
                    rows: [
                      {
                        columns: [
                          {
                            contents: [
                              {
                                type: "text",
                                values: {
                                  text:  response.data.message
                                }
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                };
              }
              if (this.emailEditorReady && this.emailEditor?.editor?.loadDesign) {
                this.emailEditor.editor.loadDesign(designToLoad);
              } else {
                this.pendingEmailDesign = designToLoad;
              }
            }
            if ([6, 8].includes(this.CampaignPostForm.get('type').value) && response.data.videoUrl) {
              this.videoUrl = response.data.videoUrl;
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

    this.attemptedSubmit = true;
    const type = this.CampaignPostForm.get('type')?.value;
    if (type === 7 && !this.uploadedVideoUrl) {
      this.toaster.error('Please upload an image or video for LinkedIn post.');
      return;
    }
    if (type === 8 && !this.uploadedVideoUrl) {
      this.toaster.error('Please upload a video for YouTube post.');
      return;
    }
    if (this.CampaignPostForm.valid) {
      this.GetMessagePromise()
        .then(() => {
          var templateData = this.CampaignPostForm.value;
          this.CampainIdFromTemplate = this.CampaignPostForm.value.campaignId;
          templateData.id = this.id ? this.id : 0;
          templateData.campainId = this.CampainIdFromTemplate;
          templateData.VideoUrl = this.uploadedVideoUrl;
          var request = { data: templateData };
          if (this.editMode) {
            this.service.UpdateCampaignPost(request).subscribe({
              next: (response: any) => {
                this.toaster.success('Post Updated successfully');
                this.route.navigate(['/list-campaign-posts'], {
                  queryParams: { campaignId: this.CampainIdFromTemplate }
                });
              }
            });
          } else if (!this.smsPlatform) {
            this.service.AddCampaignPost(request).subscribe({
              next: (response: any) => {
                this.toaster.success('Post Created successfully');
                this.route.navigate(['/list-campaign-posts'], {
                  queryParams: { campaignId: this.CampainIdFromTemplate }
                });
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
        } else if (this.CampaignPostForm.controls.type.value == 9) {
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
    this.emailEditorReady = true;
    if (this.pendingEmailDesign && this.emailEditor?.editor?.loadDesign) {
      this.emailEditor.editor.loadDesign(this.pendingEmailDesign);
      this.pendingEmailDesign = null;
    }
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
      type: type,
      subject: '',
      message: ''
    });

    this.simpleText = '';
    this.editorContent = '';
    this.videoUrl = null;
    this.uploadedVideoUrl = '';

    this.aiImagePrompt = '';
    this.aiImageResults = [];
    this.selectedAIImageIndex = null;
    this.aiImageResultUrl = null;
    this.aiImageError = null;

    this.smsPlatform = '';

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.selectedFileType = null;
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
    } else if (this.smsPlatform === 'Youtube') {
      this.CampaignPostForm.patchValue({ type: 8 });
    } else if (this.smsPlatform === 'Pinterest') {
      this.CampaignPostForm.patchValue({ type: 9 });
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
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileType = file.type;
      const isImage = fileType.startsWith('image/');
      const isVideo = fileType.startsWith('video/');

      if (!isImage && !isVideo) {
        this.toaster.error('Please upload a valid image or video file.');
        return;
      }
      // Always clear previous preview
      this.videoUrl = null;
      this.selectedFileType = isImage ? 'image' : 'video';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.videoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.service.uploadMediaFile(file)
        .then((response: any) => {
          this.uploadedVideoUrl = response.url;
          this.toaster.success(isImage ? 'Image uploaded successfully!' : 'Video uploaded successfully!');
        })
        .catch((error: any) => {
          console.error('File upload failed', error);
          this.toaster.error('Failed to upload file');
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

  getAcceptType(): string {
    const type = this.CampaignPostForm.get('type').value;
    if (type === 5) return 'image/*';
    if (type === 6 || type === 7 || type === 8) return 'video/*';
    return '';
  }

  removeSelectedFile(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.videoUrl = '';
    this.uploadedVideoUrl = '';
  }

  openAIImageModal() {
    this.showAIImageModal = true;
    this.aiImagePrompt = '';
    this.aiImageResultUrl = null;
    this.aiImageResults = [];
    this.selectedAIImageIndex = null;
    this.aiImageError = null;
  }

  closeAIImageModal() {
    this.showAIImageModal = false;
    this.aiImagePrompt = '';
    this.aiImageResultUrl = null;
    this.aiImageResults = [];
    this.selectedAIImageIndex = null;
    this.aiImageError = null;
    this.aiImageLoading = false;
  }

  generateImageWithAI() {
    if (!this.aiImagePrompt.trim()) {
      this.aiImageError = 'Prompt is required.';
      return;
    }
    this.aiImageLoading = true;
    this.aiImageError = null;
    this.aiImageResultUrl = null;
    this.aiImageResults = [];
    this.selectedAIImageIndex = null;
    this.textGenService.generateImageWithHorde(this.aiImagePrompt).subscribe({
      next: (res: any) => {
        this.aiImageResults = Array.isArray(res.images) ? res.images : [];
        this.aiImageResultUrl = this.aiImageResults.length > 0 ? this.aiImageResults[0] : null;
        this.selectedAIImageIndex = this.aiImageResults.length > 0 ? 0 : null;
        this.aiImageLoading = false;
        if (!this.aiImageResults.length) {
          this.aiImageError = 'No image returned.';
        }
      },
      error: (err) => {
        this.aiImageError = 'Failed to generate image.';
        this.aiImageLoading = false;
      }
    });
  }

  selectAIImage(index: number) {
    this.selectedAIImageIndex = index;
    this.aiImageResultUrl = this.aiImageResults[index];
  }

  openManualEditorModal() {
    if (this.selectedAIImageIndex !== null && this.aiImageResults[this.selectedAIImageIndex]) {
      this.manualEditorImageUrl = this.aiImageResults[this.selectedAIImageIndex];
      this.showManualEditorModal = true;
      this.editorLoading = false;
      setTimeout(() => {
        if (this.imageEditor && this.manualEditorImageUrl) {
          this.imageEditor.open(this.manualEditorImageUrl);
        }
      }, 100);
    }
    else if (this.manualEditorImageUrl) {
      this.showManualEditorModal = true;
      this.editorLoading = false;
      setTimeout(() => {
        if (this.imageEditor && this.manualEditorImageUrl) {
          this.imageEditor.open(this.manualEditorImageUrl);
        }
      }, 100);
    }
    // Otherwise, prompt for upload
    else {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.manualEditorImageUrl = reader.result as string;
            this.showManualEditorModal = true;
            this.editorLoading = false;
            setTimeout(() => {
              if (this.imageEditor && this.manualEditorImageUrl) {
                this.imageEditor.open(this.manualEditorImageUrl);
              }
            }, 100);
            document.body.removeChild(fileInput);
          };
          reader.readAsDataURL(file);
        } else {
          document.body.removeChild(fileInput);
        }
      };
      fileInput.click();
    }
  }

  initImageEditor() {
    if (this.imageEditor && this.manualEditorImageUrl) {
      this.imageEditor.open(this.manualEditorImageUrl);
      this.editorLoading = false;
    }
  }

  closeManualEditorModal() {
    this.showManualEditorModal = false;
    this.editorLoading = false;
  }

  saveEditedImage() {
    if (this.imageEditor) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const filename = `post-${yyyy}-${mm}-${dd}.png`;
      this.imageEditor.export('PNG', filename);
      this.closeManualEditorModal();
    }
  }

  openAIEditModal() {
    if (this.selectedAIImageIndex !== null && this.aiImageResults[this.selectedAIImageIndex]) {
      this.aiImageResultUrl = this.aiImageResults[this.selectedAIImageIndex];
      this.showAIEditModal = true;
      this.aiEditPrompt = '';
      this.aiEditProcessingType = 'img2img';
      this.aiEditError = null;
      this.aiEditResultUrl = null;
    }
  }

  closeAIEditModal() {
    this.showAIEditModal = false;
    this.aiEditPrompt = '';
    this.aiEditProcessingType = 'img2img';
    this.aiEditError = null;
    this.aiEditResultUrl = null;
  }

  async submitAIEdit() {
    if (!this.aiEditPrompt.trim()) {
      this.aiEditError = 'Prompt is required.';
      return;
    }
    if (!this.aiImageResultUrl) {
      this.aiEditError = 'No image to edit.';
      return;
    }

    this.aiEditLoading = true;
    this.aiEditError = null;
    this.aiEditResultUrl = null;

    try {
      const url: string = this.aiImageResultUrl;
      const imageName = url.substring(url.lastIndexOf('/') + 1);
      this.textGenService.editImageWithHorde({
        prompt: this.aiEditPrompt,
        base64Image: imageName,
        processingType: this.aiEditProcessingType
      }).subscribe({
        next: (res: any) => {
          this.aiEditResultUrl = res.images && res.images.length > 0 ? res.images[0] : null;
          this.aiEditLoading = false;
          if (!this.aiEditResultUrl) {
            this.aiEditError = 'No edited image returned.';
          }
        },
        error: (err) => {
          this.aiEditError = 'Failed to edit image.';
          this.aiEditLoading = false;
        }
      });
    } catch (err) {
      this.aiEditError = 'Failed to process image.';
      this.aiEditLoading = false;
    }
  }

  dataURLtoFile(dataurl: string, filename: string): Promise<File> {
    return fetch(dataurl)
      .then(res => res.arrayBuffer())
      .then(buf => new File([buf], filename, { type: 'image/png' }));
  }

  convertImageUrlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context error');
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL.replace(/^data:image\/png;base64,/, ''));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = function (err) {
        reject('Image load error');
      };
      img.src = url;
      if (img.complete || img.complete === undefined) {
        img.src = url;
      }
    });
  }

  ngAfterViewInit() {
    if (this.showManualEditorModal) {
    }
  }

  ngDoCheck() {
    if (this.showManualEditorModal) {
    }
  }

  openTestAIPayloadModal() {
    if (this.selectedAIImageIndex !== null && this.aiImageResults[this.selectedAIImageIndex]) {
      this.testAIPayloadImage = this.aiImageResults[this.selectedAIImageIndex];
      this.testAIPayloadPrompt = this.aiImagePrompt;
    } else {
      this.testAIPayloadImage = null;
      this.testAIPayloadPrompt = '';
    }
    this.showTestAIPayloadModal = true;
  }

  closeTestAIPayloadModal() {
    this.showTestAIPayloadModal = false;
  }

  onTestAIPayloadFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.testAIPayloadImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveTestAIPayload() {
    if (!this.testAIPayloadImage || !this.testAIPayloadPrompt) return;
    if (!this.testAIPayloadImage.startsWith('data:image')) {
      const imgUrl = this.testAIPayloadImage;
      fetch(imgUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            let base64Image = reader.result as string;
            if (base64Image.startsWith('data:image')) {
              base64Image = base64Image.split(',')[1];
            }
            const payload = {
              image: base64Image,
              prompt: this.testAIPayloadPrompt
            };
            this.textGenService.Edit(payload).subscribe({
              next: () => {
                this.toaster.success('Payload saved successfully!');
                this.closeTestAIPayloadModal();
              },
              error: () => {
                this.toaster.error('Failed to save payload');
              }
            });
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          this.toaster.error('Failed to process image');
        });
    } else {
      let base64Image = this.testAIPayloadImage.split(',')[1];
      const payload = {
        image: base64Image,
        prompt: this.testAIPayloadPrompt
      };
      this.textGenService.Edit(payload).subscribe({
        next: () => {
          this.toaster.success('Payload saved successfully!');
          this.closeTestAIPayloadModal();
        },
        error: () => {
          this.toaster.error('Failed to save payload');
        }
      });
    }
  }

  onManualImageFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.manualEditorImageUrl = reader.result as string;
        if (this.imageEditor) {
          this.imageEditor.open(this.manualEditorImageUrl);
          this.editorLoading = false;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  insertManualEditorImageToContent() {
    if (!this.imageEditor) return;
    const imageData = this.imageEditor.getImageData();
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      // Instead of inserting into content, upload as if via upload button
      this.uploadExternalVideoOrImage(dataUrl, 'image');
    }
    // Close all modals
    this.showManualEditorModal = false;
    this.showAIImageModal = false;
    this.showAIEditModal = false;
    this.showTestAIPayloadModal = false;
  }

  onSimpleTextChange(value: string) {
    this.simpleText = value;
    this.CampaignPostForm.get('message').setValue(value);
  }

  /**
   * Uploads an external image or video (from AI or manual editor) as if selected via the upload button.
   *
   * Usage:
   *   // In your AI or manual modal/component, when the user clicks 'Add to content' for an image or video:
   *   this.uploadExternalVideoOrImage(url, 'video'); // or 'image'
   *
   * This will upload the file and update the preview/upload state, but WILL NOT insert the file into the message/content editor.
   *
   * Do NOT update editorContent, simpleText, or any message field with the file.
   *
   * @param url The URL or data URL of the image/video
   * @param type 'image' or 'video'
   */
  async uploadExternalVideoOrImage(url: string, type: 'image' | 'video') {
    try {
      let blob: Blob;
      if (url.startsWith('data:')) {
        const arr = url.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) {
          this.toaster.error('Invalid data URL format');
          return;
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        const response = await fetch(url);
        blob = await response.blob();
      }
      const ext = type === 'video' ? 'mp4' : 'png';
      const file = new File([blob], `external-upload.${ext}`, { type: blob.type });
      this.selectedFileType = type;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.videoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.service.uploadMediaFile(file)
        .then((uploadResponse: any) => {
          this.uploadedVideoUrl = uploadResponse.url;
          this.toaster.success(type === 'image' ? 'Image uploaded successfully!' : 'Video uploaded successfully!');
        })
        .catch((error: any) => {
          this.toaster.error('Failed to upload file');
        });
    } catch (err) {
      this.toaster.error('Failed to process file');
    }
  }

  // onImageSelection(event: Event){
  //   let fileinput = event.target as HTMLInputElement;
  //   const file = fileinput.files?.[0];
  //   if (file){
  //     const reader = new FileReader();
  //     reader.onload = () =>{
  //       const base64Image = reader.result as string;
  //       this.pinterestFile = base64Image;
  //     }
  //     reader.readAsDataURL(file)
  //     this.service.uploadMedia(this.pinterestFile).subscribe({
  //       next: (res: any) =>{
  //         this.editorContent = res.url
  //         console.log(res);
  //       }
  //     })
  //   }

  // }

}
