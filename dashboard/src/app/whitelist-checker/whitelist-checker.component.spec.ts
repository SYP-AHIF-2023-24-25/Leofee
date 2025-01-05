import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitelistCheckerComponent } from './whitelist-checker.component';

describe('WhitelistCheckerComponent', () => {
  let component: WhitelistCheckerComponent;
  let fixture: ComponentFixture<WhitelistCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhitelistCheckerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhitelistCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
