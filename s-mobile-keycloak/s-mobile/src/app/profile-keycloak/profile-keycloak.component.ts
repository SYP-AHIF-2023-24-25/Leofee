import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { createLeoUser, LeoUser, Role } from '../../core/util/leo-token';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';

// COMPONENT IS ONLY FOR TESTING PURPOSES
// SOMETHINGS WILL LATER BE WRITTEN ON THE GIFT-CARD COMPONENT
@Component({
  selector: 'app-profile-keycloak',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    QRCodeModule
  ],
  templateUrl: './profile-keycloak.component.html',
  styleUrl: './profile-keycloak.component.css'
})
export class ProfileKeycloakComponent {
  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  public readonly userName: WritableSignal<string | null> = signal(null);
  public leoUserRole: WritableSignal<Role | null> = signal(null);
  public readonly username: WritableSignal<string | null> = signal(null);
  public readonly qrCodeData: WritableSignal<string> = signal("");

  async ngOnInit(): Promise<void> {
    const user: LeoUser = await createLeoUser(this.keycloakService);
    this.getFullName(user);
    this.getRole(user);
    this.getUsername(user);
    this.generateQRCodeData(user);
  }

  public async getFullName(user: LeoUser): Promise<void> {
    this.userName.set(user.fullName);
  }

  public async getRole(user: LeoUser): Promise<void> {
    this.leoUserRole.set(user.role);
  }

  public async getUsername(user: LeoUser): Promise<void> {
    this.username.set(user.username);
  }

  public async generateQRCodeData(user: LeoUser): Promise<void> {
    this.qrCodeData.set(`${user.username}`)

  }
}
