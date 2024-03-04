import { Component, OnInit } from '@angular/core';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private authService: MsalService, private client: HttpClient, private router: Router) {
    
  }
  //constructor(private authService: AuthService) { }

  ngOnInit(): void {
    console.log(localStorage.getItem('profile'));	
    let profileItem = localStorage.getItem('profile');
    if (profileItem !== null) {
      console.log(profileItem);
      this.profile = JSON.parse(profileItem);
    }
    // Annahme: AuthService enthält eine Methode zum Abrufen des eingeloggten Benutzers und seines Geldbetrags
    //this.geldbetrag = this.authService.getGeldbetrag();
   // this.eingeloggterBenutzer = this.authService.getEingeloggterBenutzer();
  }
}