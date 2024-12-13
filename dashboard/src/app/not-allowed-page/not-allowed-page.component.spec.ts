import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAllowedPageComponent } from './not-allowed-page.component';

describe('NotAllowedPageComponent', () => {
  let component: NotAllowedPageComponent;
  let fixture: ComponentFixture<NotAllowedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotAllowedPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotAllowedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
