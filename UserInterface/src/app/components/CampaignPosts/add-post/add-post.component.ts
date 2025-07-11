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
    ImageEditorSharedModule,
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
    type: new FormControl(null, Validators.required), // Changed from 0 to null and added Validators.required
    html: new FormControl('')
  });
  campaigns: any[] = [];
  @ViewChild(EmailEditorComponent) private emailEditor!: EmailEditorComponent;
  @ViewChild('dateTimeInput') dateTimeInput!: ElementRef;
  @ViewChild('imageEditor') imageEditor!: any;
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
  showAIImageModal: boolean = false;
  aiImagePrompt: string = '';
  aiImageLoading: boolean = false;
  aiImageResultUrl: string | null = null;
  aiImageResults: string[] = [];
  selectedAIImageIndex: number | null = null;
  showManualEditorModal: boolean = false;
  manualEditorImageUrl: string | null = null;
  aiImageError: string | null = null;
  showImageEditorModal: boolean = false;
  imageEditorUrl: string | null = null;
  editedImageDataUrl: string | null = null;
  aiEditPrompt: string = '';
  aiEditProcessingType: string = 'img2img';
  aiEditLoading: boolean = false;
  aiEditError: string | null = null;
  aiEditResultUrl: string | null = null;
  showAIEditModal: boolean = false;
  editorLoading: boolean = false;
  showTestAIPayloadModal: boolean = false;
  testAIPayloadImage: string | null = null;
  testAIPayloadPrompt: string = '';

  public imageEditorSettings: any = {
    width: '100%',
    height: '500px',
    toolbar: ['Undo', 'Redo', 'ZoomIn', 'ZoomOut', 'Pan', 'Crop', 'Transform', 'Annotate', 'Filter', 'Finetune', 'Shape', 'Frame', 'Text', 'Pen', 'Eraser']
  };


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
      this.editorLoading = true;
      setTimeout(() => this.initImageEditor(), 200);
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
      this.imageEditor.export('PNG', (dataUrl:any) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.aiImageResultUrl = dataUrl;
        if (this.selectedAIImageIndex !== null) {
          this.aiImageResults[this.selectedAIImageIndex] = dataUrl;
        }
        this.closeManualEditorModal();
      });
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
    // Default to selected image and prompt if available
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
    // Ensure the image is a Data URL and read as Data URL if not already
    if (!this.testAIPayloadImage.startsWith('data:image')) {
      // If not a data URL, try to convert it using FileReader
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
      // Already a data URL
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

}
