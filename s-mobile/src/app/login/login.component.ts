import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = "";
  password: string = "";

  constructor() { }

  onSubmit() {
    // Hier würdest du die Logik für die Authentifizierung implementieren, z.B. eine Anfrage an einen Authentifizierungsservice senden.
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    // Beispiel: Wenn die Authentifizierung erfolgreich ist, könntest du den Benutzer weiterleiten.
  }
}
