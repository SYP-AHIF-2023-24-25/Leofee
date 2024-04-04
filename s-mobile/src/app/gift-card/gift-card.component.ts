import { Component, OnInit } from '@angular/core';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { ServiceService } from '../service/service.service';
import { identifierName } from '@angular/compiler';


//import { AuthService } from '../auth.service'; // Annahme: AuthService enthält Logik für die Benutzerauthentifizierung

@Component({
  selector: 'gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.css']
})
export class GiftCardComponent implements OnInit {
  geldbetrag: number = 0;
  eingeloggterBenutzer: string = "";
  userId : any = "";
  qrCodeImage: string = "";
  qrCodeData: string = this.userId // Hier gehört dann die Id vom eingeloggten Benutzer rein und der Geldbetrag
  showQRCode: boolean = false;
  user: string = "";

  constructor(private authService: MsalService, private client: HttpClient, private router: Router, private serviceService: ServiceService) {
    
  }

  ngOnInit(): void {
    this.loadStudentData();
  }
  
  async loadStudentData() {
    const studentId = '532d83eb807aa78eba671ee7875abc201a5835e2d4e41aa2b0959aacb3e80aae'; // Hier müssten Sie die Id des eingeloggten Benutzers abrufen, falls nicht statisch
    
    await this.serviceService.getStudentDataById(studentId).subscribe(student => {
      console.log(student)
      this.userId = student.id; 
      this.user = student.lastname;
    });

    this.serviceService.getStudentBalanceById(studentId).subscribe(balance => {
      this.geldbetrag = balance;
      this.qrCodeData = `${studentId}-${balance}`; 
      this.generateQRCode();
    });
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
    }
      
    // Annahme: AuthService enthält eine Methode zum Abrufen des eingeloggten Benutzers und seines Geldbetrags
    //this.geldbetrag = this.authService.getGeldbetrag();
   // this.eingeloggterBenutzer = this.authService.getEingeloggterBenutzer();
  
}