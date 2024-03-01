import { Component, OnInit } from '@angular/core';
//import { AuthService } from '../auth.service'; // Annahme: AuthService enthält Logik für die Benutzerauthentifizierung

@Component({
  selector: 'gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.css']
})
export class GiftCardComponent implements OnInit {
  geldbetrag: number = 0;
  eingeloggterBenutzer: string = "";

  //constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Annahme: AuthService enthält eine Methode zum Abrufen des eingeloggten Benutzers und seines Geldbetrags
    //this.geldbetrag = this.authService.getGeldbetrag();
   // this.eingeloggterBenutzer = this.authService.getEingeloggterBenutzer();
  }
}