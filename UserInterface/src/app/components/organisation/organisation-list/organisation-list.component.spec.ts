import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationListComponent } from './organisation-list.component';

describe('OrganisationListComponent', () => {
  let component: OrganisationListComponent;
  let fixture: ComponentFixture<OrganisationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganisationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
