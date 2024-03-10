import { Component, OnInit } from '@angular/core';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';


//import { AuthService } from '../auth.service'; // Annahme: AuthService enthält Logik für die Benutzerauthentifizierung

@Component({
  selector: 'gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.css']
})
export class GiftCardComponent implements OnInit {
  geldbetrag: number = 0;
  eingeloggterBenutzer: string = "";
  profile: string = "";
  qrCodeImage: string = "";
  qrCodeData: string = 'Er Funktioniert zumindest'; // Hier gehört dann die Id vom eingeloggten Benutzer rein und der Geldbetrag
  showQRCode: boolean = false;

  constructor(private authService: MsalService, private client: HttpClient, private router: Router) {
    
  }

  ngOnInit(): void {
    
    //this.generateQRCode();
  }
  
  generateQRCode() {
    QRCode.toDataURL(this.qrCodeData)
      .then(url => {
        this.qrCodeImage = url;
        this.showQRCode = true;
      })
      .catch(err => {
        console.error(err);
      });
  
      
    // Annahme: AuthService enthält eine Methode zum Abrufen des eingeloggten Benutzers und seines Geldbetrags
    //this.geldbetrag = this.authService.getGeldbetrag();
   // this.eingeloggterBenutzer = this.authService.getEingeloggterBenutzer();
  }
}