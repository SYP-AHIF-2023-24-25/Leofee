import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dashboard';
  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  private router: Router = inject(Router);
  public async logOutNavBar() {
    if(!this.keycloakService.isLoggedIn()){
      return;
    }
    await this.keycloakService.logout().then(() => {
      console.log('User is not white listed');
      this.keycloakService.clearToken();
    });
    //this.router.navigate(['/userInWhiteList']);
  }
}
