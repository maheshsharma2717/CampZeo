import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../../services/app-service.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { dataBinding } from '@syncfusion/ej2-angular-schedule';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { GridModule, PageService, SortService, FilterService, ToolbarService } from '@syncfusion/ej2-angular-grids';
@Component({
  selector: 'app-organisation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxPaginationModule, FormsModule, GridModule],
  providers: [PageService, SortService, FilterService, ToolbarService],
  templateUrl: './organisation-list.component.html',
  styleUrl: './organisation-list.component.css'
})
export class OrganisationListComponent implements OnInit, OnDestroy {
  Organisations: any[] = [];
  organisationToDeleteId: number | null = null;
  private routerSubscription: Subscription | null = null;
  isSidebarCollapsed = false;
  isMobileNavOpen = false;
  currentPage: number = 1;
  PageSize: any = 10;
  SearchText: any = "";
  TotalCount: any;
  totalPages: any;
  pages: any
  isSuspendedFilter: string = 'false';
  sortBy: string = 'createdDate';
  sortDesc: boolean = false;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  isRecovering: boolean = false;
  pageSettings = { pageSize: 10, pageSizes: [5, 10, 20, 50] };
  toolBarOptions = ['Custom'];
  token: string | null = null;
i=0;

  constructor(public service: AppService, private toaster: ToastrService,
    private router: Router, private authService: AuthService
  ) {

  }

  ngOnInit(): void {
    this.loadOrganisations()
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeModal();
        this.cleanupBackdrop();
      }
    });
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDesc = !this.sortDesc;
    } else {
      this.sortBy = column;
      this.sortDesc = false;
    }
    this.loadOrganisations(); 
  }

  onPageSizeChange(): void {
    this.currentPage = 1; 
    this.loadOrganisations(); 
  }

  loadOrganisations(): void {
    var request: any = {
      data: {
        pageNumber: this.currentPage,
        pageSize: this.PageSize,
        searchText: this.SearchText,
        sortBy: this.sortBy,
        sortDesc: this.sortDesc
      }
    }
    if (this.isSuspendedFilter != '') { request.data.isDeleted = this.isSuspendedFilter === '' ? null : this.isSuspendedFilter === 'true'; }
    this.service.GetOrganisations(request).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.Organisations = response.data.list;
          this.TotalCount = response.data.totalCount;
          this.calculatePagination();
        }
      }
    });
  }
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.TotalCount / this.PageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrganisations();
    }
  }
  approveItem(data: any) {
    if (data.isApproved) {
      this.toaster.warning('This organisation is already approved.');
      return;
    }
    var organisationId = data.id;
    var request = { data: organisationId }
    this.service.ApproveOrganisation(request).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          data = response.data;
          this.toaster.success('Organisation approved successfully.');
          this.loadOrganisations()
        }
      }
    })
  }

  // onLogin(item: any) {
  //   this.service.LogInAsOrgenisation(item.id).subscribe({
  //     next: (response: any) => {
  //       if (response.isSuccess) {
  //         // Set current active token
  //         this.service.SetToken(response.data.token, false);

  //         // Save impersonated user token separately
  //         localStorage.setItem('user_token', response.data.token);

  //         this.service.User = response.data;
  //         // this.toaster.success('Login success');

  //         if (response.data) {
  //           this.router.navigate(['/profile'], { queryParams: { i: 'CompleteProfile' } });
  //         }
  //       } else {
  //         this.toaster.warning('Organistion is not approved yet');
  //       }
  //     }
  //   });
  // }

  onLogin(item: any) {

    // if (!item.isApproved){
    //    this.toaster.warning('Organisation is not approved yet');
    //    return;
    // }

    var adminToken = localStorage.getItem('token') ? localStorage.getItem('token') : sessionStorage.getItem('token')
    localStorage.setItem('admin_token', adminToken || "");

    this.service.LogInAsOrgenisation(item.id).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          sessionStorage.removeItem('token')
          localStorage.removeItem('token')
          this.service.ValidateToken(response.data.token)
          this.router.navigate(['/profile'], { queryParams: { i: 'CompleteProfile' } });
        } else {
          this.toaster.warning('Organisation is not approved yet');
        }
      }
    });
  }

  SuspendOrRecover(): void {
    if (this.organisationToDeleteId !== null) {
      this.closeModal();
      this.service.showSpinner = true;
      this.service.SuspendOrRecoverOrganisation(this.organisationToDeleteId).subscribe({
        next: () => {
          this.Organisations.find(org => org.id == this.organisationToDeleteId).isDeleted = !this.isRecovering;
          this.toaster.success(!this.isRecovering ? 'Organisation suspended successfully' : 'Organisation recovered successfully');
          this.loadOrganisations();
          this.service.showSpinner = false;
        },
        error: () => {
          this.toaster.error('Error deleting organisation');
          this.service.showSpinner = false;
        }
      });
    }
  }

  openSuspendModal(id: number, isRecovering: boolean = false): void {
    this.organisationToDeleteId = id;

    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
      this.isRecovering = isRecovering;
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();

      }
    }
  }

  cleanupBackdrop(): void {
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  pageChangeEvent(event: number) {
    this.currentPage = event;
  }

  approveItemById(id: number) {
    const index = this.Organisations.findIndex(org => org.id === id);
    if (index !== -1) {
      this.approveItem(index);
    }
  }

  onGridActionBegin(args: any) {
    if (args.requestType === 'paging') {
      this.currentPage = args.currentPage;
      this.PageSize = args.pageSize;
      this.loadOrganisations();
    } else if (args.requestType === 'sorting') {
      this.sortBy = args.columnName;
      this.sortDesc = args.direction === 'Descending';
      this.loadOrganisations();
    }
  }

}
