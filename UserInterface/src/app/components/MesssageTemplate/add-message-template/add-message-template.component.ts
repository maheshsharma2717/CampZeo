import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmailEditorComponent, EmailEditorModule } from 'angular-email-editor';
import { AppService } from '../../../services/app-service.service';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill'
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-message-template',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmailEditorModule, CommonModule, QuillModule, RouterModule],
  templateUrl: './add-message-template.component.html',
  styleUrl: './add-message-template.component.css'
})
export class AddMessageTemplateComponent {
  MessageTemplateForm: any = new FormGroup({
  subject: new FormControl('', Validators.required),
  message: new FormControl(''),
  senderEmail: new FormControl('', [Validators.required, Validators.email]),
  organisationName: new FormControl('', [Validators.required]),
  scheduledPostTime: new FormControl('', Validators.required),
  type: new FormControl(1),
  html: new FormControl('')
  });

  @ViewChild(EmailEditorComponent) private emailEditor!: EmailEditorComponent;
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
  constructor(private service: AppService, private toaster: ToastrService, private activatedRoute: ActivatedRoute, private route: Router) {
    this.activatedRoute.queryParams.subscribe(param => {
      this.id = param['id']
      if (this.id) {
        this.editMode = true
      } else {
        this.getMessageTemplateDetails();
      }
      this.smsPlatform = param['type'];
    })
  }

  getMessageTemplateDetails() {
    this.service.getMessageTemplateDetails().subscribe((response: any) => {
      debugger;
      this.MessageTemplateForm.patchValue({
        senderEmail: response.data.email,
        organisationName: response.data.name
      });

    })
  }

  ngOnInit(): void {
    if (this.id) {
      const request = { data: this.id };
      this.service.GetMessagetemplateById(request).subscribe({
        next: (response: any) => {
          if (response?.data) {
            this.CampainIdFromTemplate = response.data.campainId
            this.MessageTemplateForm.patchValue(response.data);
            if (this.MessageTemplateForm.get('type').value === 1) {
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
            else if (this.MessageTemplateForm.get('type').value === 4) {
              this.editorContent = response.data.message;
            }
            else if (this.MessageTemplateForm.get('type').value === 5) {
              this.editorContent = response.data.message;
            }
            else if (this.MessageTemplateForm.get('type').value === 6) {
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
  }

  onSubmit(): void {
    debugger
    if (this.MessageTemplateForm.valid) {
      this.GetMessagePromise()
        .then(() => {
          var templateData = this.MessageTemplateForm.value;
          templateData.id = this.id ? this.id : 0
          templateData.campainId = this.CampainIdFromTemplate;
          templateData.VideoUrl = this.uploadedVideoUrl;
          var request = { data: templateData };
          if (!this.smsPlatform) {
            this.service.AddMessagetemplate(request).subscribe({
              next: (response: any) => {
                this.toaster.success("Updated successfully");
                this.route.navigate(['/list-message-templates'])
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

  submitFromCampain(request: any): void {
    let campaignId = localStorage.getItem("campainId")

    if (campaignId) {
      this.service.AddMessagetemplateFromCampain(parseInt(campaignId), request).subscribe({
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
        if (this.MessageTemplateForm.controls.type.value == 1) {
          this.emailEditor.editor.exportHtml((data: any) => {
            this.MessageTemplateForm.patchValue({
              message: data.html + "[{(break)}]" + JSON.stringify(data.design)
            });
            resolve();
          });
        }
        else if (this.MessageTemplateForm.controls.type.value == 4) {
          this.MessageTemplateForm.patchValue({
            message: this.editorContent
          });
          resolve();
        } else if (this.MessageTemplateForm.controls.type.value == 5) {
          this.MessageTemplateForm.patchValue({
            message: this.editorContent
          });
          resolve();
        } else if (this.MessageTemplateForm.controls.type.value == 6) {
          this.MessageTemplateForm.patchValue({
            message: this.editorContent
          });
          resolve();
        }
        else {
          this.MessageTemplateForm.patchValue({
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

    this.MessageTemplateForm.patchValue({
      type: type
    })
    this.smsPlatform = '';
  }

  ngOnChanges() {
    this.setFormTypeBasedOnPlatform();
  }

  setFormTypeBasedOnPlatform() {
    if (this.smsPlatform === 'Email') {
      this.MessageTemplateForm.patchValue({ type: 1 });
    } else if (this.smsPlatform === 'SMS') {
      this.MessageTemplateForm.patchValue({ type: 2 });
    } else if (this.smsPlatform === 'WhatsApp') {
      this.MessageTemplateForm.patchValue({ type: 3 });
    } else if (this.smsPlatform === 'RCS') {
      this.MessageTemplateForm.patchValue({ type: 4 });
    } else if (this.smsPlatform === 'Facebook') {
      this.MessageTemplateForm.patchValue({ type: 5 });
    } else if (this.smsPlatform === 'Instagram') {
      this.MessageTemplateForm.patchValue({ type: 6 });
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

}
