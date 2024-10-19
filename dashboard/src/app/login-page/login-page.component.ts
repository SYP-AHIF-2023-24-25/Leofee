import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  providers: [KeycloakService],
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  isLoggedIn = false;

  constructor(private keycloakService: KeycloakService, private router: Router) {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    this.keycloakService.getToken().then(token => {
      console.log(token);
    });
  }

  async login(): Promise<void> {
    if (this.isLoggedIn) {
      return
    }
    await this.keycloakService.login()
  }

  public async logout(): Promise<void> {
    if (!this.isLoggedIn) {
      return;
    }
    await this.keycloakService.logout();
  }
}
