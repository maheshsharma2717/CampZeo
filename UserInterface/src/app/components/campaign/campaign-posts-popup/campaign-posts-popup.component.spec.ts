import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignPostsPopupComponent } from './campaign-posts-popup.component';

describe('CampaignPostsPopupComponent', () => {
  let component: CampaignPostsPopupComponent;
  let fixture: ComponentFixture<CampaignPostsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignPostsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignPostsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
