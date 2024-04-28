import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { createLeoUser, LeoUser } from '../../core/util/leo-token';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile-keycloak',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule
  ],
  templateUrl: './profile-keycloak.component.html',
  styleUrl: './profile-keycloak.component.css'
})
export class ProfileKeycloakComponent {
  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  public readonly userName: WritableSignal<string | null> = signal(null);
  
  public async getFullName(): Promise<void> {
    const user: LeoUser = await createLeoUser(this.keycloakService);
    this.userName.set(user.fullName);
  }
}
