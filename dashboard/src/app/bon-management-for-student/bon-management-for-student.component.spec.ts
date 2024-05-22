import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonManagementForStudentComponent } from './bon-management-for-student.component';

describe('BonManagementForStudentComponent', () => {
  let component: BonManagementForStudentComponent;
  let fixture: ComponentFixture<BonManagementForStudentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BonManagementForStudentComponent]
    });
    fixture = TestBed.createComponent(BonManagementForStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
