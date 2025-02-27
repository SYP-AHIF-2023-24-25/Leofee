import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-not-allowed-page',
  templateUrl: './not-allowed-page.component.html',
  styleUrl: './not-allowed-page.component.css'
})
export class NotAllowedPageComponent{
  constructor(private keyCloakService: KeycloakService){

  }
  public async backToLoginScreen(){
    await this.keyCloakService.logout("/").then(() => {
    console.log('User is not white listed');
    this.keyCloakService.clearToken();
  });
  }
}
