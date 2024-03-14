import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QRScannerDialogComponent } from './qrscanner-dialog-component.component';

describe('QRScannerDialogComponentComponent', () => {
  let component: QRScannerDialogComponent;
  let fixture: ComponentFixture<QRScannerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QRScannerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QRScannerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
