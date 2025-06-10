import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMessageTemplateComponent } from './add-message-template.component';

describe('AddMessageTemplateComponent', () => {
  let component: AddMessageTemplateComponent;
  let fixture: ComponentFixture<AddMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMessageTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
