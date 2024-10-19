import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { createLeoUser, LeoUser } from 'src/core/util/leo-token';
import { WhiteListServiceService } from 'src/services/white-list-service.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  providers: [KeycloakService],
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  isLoggedIn = false;
  private username: string = '';
  private fullName: string = '';



  constructor(private keycloakService: KeycloakService, private router: Router, 
    private whiteListService: WhiteListServiceService) {
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    this.keycloakService.getToken().then(token => {
      console.log(token);
    });
  }

  async ngOnInit(): Promise<void> {
    const leoUser: LeoUser = await createLeoUser(this.keycloakService);
  }

  async login(): Promise<void> {
    if (this.isLoggedIn) {
      return
    }
    const leoUser: LeoUser = await createLeoUser(this.keycloakService);

    await this.keycloakService.login()
    this.router.navigate(['/studentsOverview']);
  }

  async logout(): Promise<void> {
    if (!this.isLoggedIn) {
      return;
    }
    await this.keycloakService.logout();
  }

  // private async checkIfUserIsWhiteListed(username: any): Promise<boolean> {
  //   this.whiteListService.checkIfUserIsWhiteListed(username);
    
  // }
}
