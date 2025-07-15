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
  },);

  CampaignId: any;
  editMode: boolean = false;
  originalCampaignData: any = null;
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
          this.originalCampaignData = { ...response.data };
        }
      })
    }
   
  }
  onSubmit() {
    if (this.campaignForm.valid) {
      if (this.editMode && this.originalCampaignData) {
        const current = this.campaignForm.value;
        const original = this.originalCampaignData;
        const isUnchanged =
          current.name === original.name &&
          current.description === original.description &&
          current.startDate === original.startDate &&
          current.endDate === original.endDate;
        if (isUnchanged) {
          this.toastr.warning('No changes detected. Please update at least one field before saving.');
          return;
        }
      }
      var request = {
        data: this.campaignForm.value
      }  
      request.data.id = parseInt(this.CampaignId ?? "0")
      this.service.AddCampaign(request).subscribe({
        next: (response: any) => {
          if (this.editMode) {
            this.toastr.success('Campaign updated successfully');
          } else {
            this.toastr.success('Campaign created successfully');
          }
          this.router.navigate(['/list-campaigns']);
        }
      })
    } else {
      console.error('Form is invalid');
    }
  }
}
