import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmailEditorComponent, EmailEditorModule } from 'angular-email-editor';
import { QuillModule } from 'ngx-quill';
import { AppService } from '../../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmailEditorModule, CommonModule, QuillModule, RouterModule],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {
  CampaignPostForm: any = new FormGroup({
    campaignId: new FormControl('', Validators.required),
    subject: new FormControl('', Validators.required),
    message: new FormControl(''),
    senderEmail: new FormControl('', [Validators.required, Validators.email]),
    organisationName: new FormControl('', [Validators.required]),
    scheduledPostTime: new FormControl('', Validators.required),
    type: new FormControl(1),
    html: new FormControl('')
  });
  campaigns: any[] = [ { id: 1, name: 'Spring Sale', startDate: '2024-05-01', endDate: '2024-05-31' },
  { id: 2, name: 'Holiday Promo', startDate: '2024-12-01', endDate: '2024-12-31' },
];
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
  filteredCampaigns :any[]=[];
campaignSearch = { name: '', startDate: '', endDate: '' };
campaignInputValue = '';
showCampaignDropdown = false;

  constructor(private service: AppService, private toaster: ToastrService, private activatedRoute: ActivatedRoute, private route: Router) {
    this.activatedRoute.queryParams.subscribe(param => {
      this.id = param['id']
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
      debugger;
      this.CampaignPostForm.patchValue({
        senderEmail: response.data.email,
        organisationName: response.data.name
      });

    })
  }
 filterCampaigns(){
    var request:any = { "data": {
    "pageSize": 100,
    "pageNumber": 1,
    "searchText": this.campaignSearch.name,
    "sortBy": "id",
    "sortDesc": true
  }};
        this.service.GetCampaigns(request).subscribe({
      next: (response: any) => {
        this.filteredCampaigns = response.data.list;
        this.campaigns = response.data.list;
      }
    });
  }
  ngOnInit(): void {
    this.filterCampaigns();
    if (this.id) {
      const request = { data: this.id };
      this.service.GetCampaignPostById(request).subscribe({
        next: (response: any) => {
          if (response?.data) {
            this.CampainIdFromTemplate = response.data.campainId
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
    debugger
    if (this.CampaignPostForm.valid) {
      this.GetMessagePromise()
        .then(() => {
          var templateData = this.CampaignPostForm.value;
          templateData.id = this.id ? this.id : 0
          templateData.campainId = this.CampainIdFromTemplate;
          templateData.VideoUrl = this.uploadedVideoUrl;
          var request = { data: templateData };
          if (!this.smsPlatform) {
            this.service.AddCampaignPost(request).subscribe({
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

selectCampaign(campaign: any) {
  this.campaignSearch.name = campaign.name;
  this.CampaignPostForm.get('campaignId')?.setValue(campaign.id);
  this.showCampaignDropdown = false;
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

}
