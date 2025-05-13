import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '../../../services/app-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-campaign',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-campaign.component.html',
  styleUrl: './add-campaign.component.css',
  providers: [DatePipe, { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: "yyyy-MM-dd" }]
})
export class AddCampaignComponent implements OnInit {
  campaignForm: any = new FormGroup({
    name: new FormControl('',  [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z ]+$') 
    ]),
    description: new FormControl(''),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl(''),
    isEmailCampaign: new FormControl(false),
    isWhatsAppCampaign: new FormControl(false),
    isRCSCampaign: new FormControl(false),
    isSmsCampaign: new FormControl(false),
    isFacebookCampaign:new FormControl(false),
    isInstagramCampaign:new FormControl(false)

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

  CampaignId: any;
  editMode: boolean = false;
  constructor(private service: AppService, private toastr: ToastrService, private router: Router, private activatedRoutes: ActivatedRoute, private fb : FormBuilder) {

    activatedRoutes.queryParams.subscribe(param => {
      this.CampaignId = param['id']
      if (this.CampaignId) {
        this.editMode = true;
      }
    })
  }
  ngOnInit(): void {
    if (this.CampaignId) {
      var request = { data: parseInt(this.CampaignId ?? "0") }
      this.service.GetCampaignById(request).subscribe({
        next: (response: any) => {
          this.campaignForm.patchValue(response.data)
        }
      })
    }
   
  }
  onSubmit() {
    if (this.campaignForm.valid) {
      var request = {
        data: this.campaignForm.value
      }  
      request.data.id = parseInt(this.CampaignId ?? "0")
      this.service.AddCampaign(request).subscribe({
        next: (response: any) => {
          this.toastr.success('Campaign created successfuly')
          this.router.navigate(['/list-campaigns']);
        }
      })
    } else {
      console.error('Form is invalid');
    }
  }
}
