import { Component, Input } from '@angular/core';
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

  @Input()
  logOutNavBar!: () => void;

  isLoggedIn = false;

  constructor(private keycloakServiceLocal: KeycloakService, private router: Router,
    private whiteListService: WhiteListServiceService) {
    this.isLoggedIn = this.keycloakServiceLocal.isLoggedIn();
    this.keycloakServiceLocal.getToken().then(token => {
      console.log(token);
    });
    this.login();

  }
  // async ngOnInit() {
  //   this.login();
  // }

  async login(): Promise<void> {
    console.log('Login');
    // if (this.isLoggedIn) {
    //    return
    //  }
    // const leoUser: LeoUser = await createLeoUser(this.keycloakServiceLocal);
    // if (!(leoUser.username === null)) {
    //   if (await this.checkIfUserIsWhiteListed(leoUser.username)) {
    //     console.log('User is white listed');
    //     await this.keycloakServiceLocal.login()
    //     this.router.navigate(['/studentsOverview']);
    //   }
    // }
    // console.log("User is not white listed");
  }

  async logout(): Promise<void> {
    // console.log('Logout');
    // // if (!this.isLoggedIn) {
    // //   return;
    // // }
    // await this.keycloakServiceLocal.logout();
    // this.router.navigate(['/']);
    if (this.logOutNavBar){
      this.logOutNavBar();
    }
  }

  // async checkIfUserIsWhiteListed(usernameLeoUser: string): Promise<boolean> {
  //   let isUserWhiteListed = false;
  //   this.whiteListService.checkIfUserIsWhiteListed(usernameLeoUser).subscribe({
  //     next: isWhiteListed => console.log(usernameLeoUser),
  //     error: err => console.error('Observer got an error: ' + err),
  //     complete: () => isUserWhiteListed = true
  //   });
  //   return isUserWhiteListed;
  // }
}
