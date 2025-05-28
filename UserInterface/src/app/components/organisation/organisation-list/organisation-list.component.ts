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

  constructor(public service: AppService, private toaster: ToastrService,
    private router: Router
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
    this.loadOrganisations(); // Reload data with new sort
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to the first page
    this.loadOrganisations(); // Reload data with the new page size
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
    var organisationId = data.id;
    var request = { data: organisationId }
    this.service.ApproveOrganisation(request).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          data = response.data;
          this.loadOrganisations()
        }
      }
    })
  }

  onLogin(item: any) {
    this.service.LogInAsOrgenisation(item.id).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.service.SetToken(response.data.token, false);
          this.service.User = response.data;
          this.toaster.success('Login success');
          if (response.data) {
            this.router.navigate(['/profile'], { queryParams: { i: 'CompleteProfile' } });
          }
        } else {
          this.toaster.error('Invalid Email or password');
        }
      }
    })
  }

  SuspendOrRecover(): void {
    if (this.organisationToDeleteId !== null) {
      this.service.SuspendOrRecoverOrganisation(this.organisationToDeleteId).subscribe({
        next: () => {
          this.Organisations.find(org => org.id == this.organisationToDeleteId).isDeleted = !this.isRecovering;
          this.toaster.show(!this.isRecovering ? 'Organisation suspended successfully' : 'Organisation recovered successfully');
          this.closeModal();
        },
        error: () => {
          this.toaster.error('Error deleting organisation');
          this.closeModal();
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
  //New function to clean up the modal backdrop
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

  //syncfusion 
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
