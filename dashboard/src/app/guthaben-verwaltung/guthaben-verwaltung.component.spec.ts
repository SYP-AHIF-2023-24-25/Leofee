import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuthabenVerwaltungComponent } from './guthaben-verwaltung.component';

describe('GuthabenVerwaltungComponent', () => {
  let component: GuthabenVerwaltungComponent;
  let fixture: ComponentFixture<GuthabenVerwaltungComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuthabenVerwaltungComponent]
    });
    fixture = TestBed.createComponent(GuthabenVerwaltungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
