import { Component,OnInit  } from '@angular/core';
import * as QRCode from 'qrcode';


@Component({
  selector: 'app-qr-code-generator',
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.css']
})
export class QrCodeGeneratorComponent implements OnInit {
  qrCodeData: string = 'http://152.67.74.231/'; // Hier gehört dann der Link zu meiner oracle vm rein
  qrCodeImage: string = '';
  guthaben: number = 3;

  constructor() { }

  ngOnInit(): void {
    this.generateQRCode();
  }

  generateQRCode() {
    QRCode.toDataURL(this.qrCodeData)
      .then(url => {
        this.qrCodeImage = url;
      })
      .catch(err => {
        console.error(err);
      });
  }
}
