import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMessageTemplateComponent } from './list-message-template.component';

describe('ListMessageTemplateComponent', () => {
  let component: ListMessageTemplateComponent;
  let fixture: ComponentFixture<ListMessageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMessageTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListMessageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
