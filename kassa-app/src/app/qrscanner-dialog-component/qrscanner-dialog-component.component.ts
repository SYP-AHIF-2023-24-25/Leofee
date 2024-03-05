
import { Component , Output, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {NgxScannerQrcodeModule} from 'ngx-scanner-qrcode';
import {
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  NgxScannerQrcodeService,
  NgxScannerQrcodeComponent,
  ScannerQRCodeSelectedFiles,
} from 'ngx-scanner-qrcode';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-qr-scanner-dialog',
  templateUrl: './qrscanner-dialog-component.component.html',
  styleUrls: ['./qrscanner-dialog-component.component.scss']
})
export class QRScannerDialogComponent  {

  @ViewChild('action') action!: NgxScannerQrcodeComponent;
  //scannedValue: string = "";
  @Output() scannedValue: EventEmitter<string> = new EventEmitter<string>();

  public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
  public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];

  dialogRef: MatDialogRef<QRScannerDialogComponent>;

  constructor(dialogRef: MatDialogRef<QRScannerDialogComponent>) {
    this.dialogRef = dialogRef;
  }

  public onEvent(e: ScannerQRCodeResult[]): void {
    if (e && e.length > 0) {
      // Schließe das Fenster
      // Hier gehe ich davon aus, dass du einen Dialog schließt
      //this.dialogRef.close();

      // Gib den gescannten QR-Code auf der Konsole aus
      console.log('Gescannter QR-Code:', e[0].value);
    }
  }


  logScannedValue(value: any): void {
    if( value != "[]") {
      console.log('Scanned Value:', value);
      this.scannedValue.emit(value);
      this.dialogRef.close(value);
     

    }    
  }


}





/*


 /*
  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    // e && action && action.pause();
    console.log(e);
  }


  
  private codeReader: BrowserQRCodeReader;

  constructor() {
    this.codeReader = new BrowserQRCodeReader();
  }

  async scanQrCode(videoElement: HTMLVideoElement): Promise<string> {
    try {
      const result = await this.codeReader.decodeFromVideoElement(videoElement);
      return result.text;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  }
 
  
  
  
  
  
  constructor(public dialogRef: MatDialogRef<QRScannerDialogComponent>) {}

  /*
  onQRCodeScanned(result: string): void {
    // Hier kannst du die Logik implementieren, die ausgeführt werden soll, wenn ein QR-Code gescannt wurde
    console.log('QR-Code gescannt:', result);
    // Schließe den Dialog nach dem Scannen
    this.dialogRef.close(result);
  }

qrCodeResult: string = "";

  
onQrCodeScanned(result: string) {
  this.qrCodeResult = result;
}

handleQrCodeResult(resultString: string) {
  console.log('QR Code result:', resultString);
}

closeDialog(): void {
  this.dialogRef.close();
}*/







