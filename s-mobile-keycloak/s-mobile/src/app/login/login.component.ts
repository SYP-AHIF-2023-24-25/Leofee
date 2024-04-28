import { Component } from '@angular/core';
import {KeycloakService} from "keycloak-angular";
//import {MatButton} from "@angular/material/button";
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
   imports: [
    CommonModule,
    NgbModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
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
    await this.router.navigate(['/gift-card'])

  }

  async logout(): Promise<void> {
    if (!this.isLoggedIn) {
      return;
    }
    await this.keycloakService.logout();
  }

}
