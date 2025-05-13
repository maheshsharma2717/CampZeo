import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrganisationComponent } from './create-organisation.component';

describe('CreateOrganisationComponent', () => {
  let component: CreateOrganisationComponent;
  let fixture: ComponentFixture<CreateOrganisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrganisationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
