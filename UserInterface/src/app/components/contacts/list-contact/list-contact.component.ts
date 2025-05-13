
import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AppService } from '../../../services/app-service.service';
import { query } from '@angular/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-list-contact',
  standalone: true,
  imports: [RouterModule, NgxPaginationModule,CommonModule,FormsModule],
  templateUrl: './list-contact.component.html',
  styleUrl: './list-contact.component.css'
})
export class ListContactComponent implements OnInit {
  Contacts: any []=[]; 
  originalContacts: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5,20, 100, 200, 1000];
  total: number = 0;
  constructor(private service: AppService, private toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute) {
  }
  ngOnInit(): void {
    this.service.GetContacts().subscribe({
      next: (response: any) => {
        this.Contacts = response.data;
        // this.originalContacts = [...response.data]; 
        this.originalContacts=this.Contacts
        this.total = this.Contacts.length;
        if (response.isSuccess) {
          // this.toastr.success(response.message)
          this.toastr.success('Contacts loaded successfully')
          }
          else{
            this.toastr.warning(response.message)
          }
      }
    })
  }
  
  EditItem(id: number) {
    this.router.navigate(['/add-contact'],{queryParams:{contactId:id}})
  }
  pageChangeEvent(event: number) {
    this.page = event;
  }
  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.page = 1;
  }
  onSearchChange(): void {
    if (this.searchTerm) {
      this.Contacts = this.originalContacts.filter(contact =>
        contact.contactName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        contact.contactMobile.includes(this.searchTerm) ||
        contact.contactWhatsApp.includes(this.searchTerm)
      );
    } else {
      this.Contacts = this.originalContacts; 
    }

    this.total = this.Contacts.length;
    this.page = 1;  
  }
  
}
