
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

  dialogRef: MatDialogRef<QRScannerDialogComponent>;

  constructor(dialogRef: MatDialogRef<QRScannerDialogComponent>) {
    this.dialogRef = dialogRef;
  }  

  ngAfterViewInit(): void {
    this.startScanner();
  }

  startScanner(): void {
    this.action.start();
  }


  logScannedValue(value: any): void {

    if( value != "[]") {
      //Json data
      //console.log('Scanned Value:', value);

      //Parse Json data
      const jsonData = JSON.parse(value);
      const scannedValue = jsonData[0].value;

      //Wert zurückgeben
      this.dialogRef.close(scannedValue);
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







