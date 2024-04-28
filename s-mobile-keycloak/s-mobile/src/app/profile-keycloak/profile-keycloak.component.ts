import { Component, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-profile-keycloak',
  standalone: true,
  imports: [],
  templateUrl: './profile-keycloak.component.html',
  styleUrl: './profile-keycloak.component.css'
})
export class ProfileKeycloakComponent {
  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  public userData: any = this.getUserInfo();

  private async getUserInfo() {
    const userInfo = await this.keycloakService.loadUserProfile();
    return userInfo;
  }
}
