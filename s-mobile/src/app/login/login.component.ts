import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loggedIn: boolean = false;
  profile?: MicrosoftGraph.User;
  title = 'aad-auth';

  

  constructor(private authService: MsalService, private client: HttpClient, private router: Router) {
    this.initializeMSAL();
  }

  ngOnInit(): void {
    this.checkAccount();
  }

  checkAccount() {
    this.loggedIn = this.authService.instance.getAllAccounts().length > 0;
  }

  async initializeMSAL() {
    await this.authService.initialize();
  }

  login() {
    this.authService
      .loginPopup()
      .subscribe((response: AuthenticationResult) => {
        this.authService.instance.setActiveAccount(response.account);
        this.checkAccount();
        this.getProfile();
      });
  }

  logout() {
    this.authService.logoutPopup();
    this.loggedIn = false;
  }

  getProfile() {
    this.client
      .get<MicrosoftGraph.User>("https://graph.microsoft.com/v1.0/me")
      .subscribe((profile) => {
        this.profile = profile
        console.log('Setting profile in localStorage', profile);
        localStorage.setItem('profile', JSON.stringify(profile));
        this.router.navigate(['/gift-card']); // Navigiere erst nach dem Abrufen des Profils
      });
  }
}
