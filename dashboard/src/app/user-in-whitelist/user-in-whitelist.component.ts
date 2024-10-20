import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { lastValueFrom } from 'rxjs';
import { createLeoUser, LeoUser } from 'src/core/util/leo-token';
import { WhiteListServiceService } from 'src/services/white-list-service.service';

@Component({
  selector: 'app-user-in-whitelist',
  templateUrl: './user-in-whitelist.component.html',
  styleUrl: './user-in-whitelist.component.css'
})
export class UserInWhitelistComponent {
  public userAllowedText: string = 'no value';
  constructor(private router: Router, private keyCloakService: KeycloakService, private whiteListService: WhiteListServiceService) {
    this.keyCloakService.getToken().then(token => {
      console.log(token);
    });
    this.ngOnInit();
  }

  async ngOnInit() {
    console.log('UserInWhitelistComponent.ngOnInit()');
    const leoUser: LeoUser = await createLeoUser(this.keyCloakService);
    if (!(leoUser.username === null)) {
      console.log('User is not null');
      let test = await this.whiteListService.checkIfUserIsWhiteListed("leoUser.username");
      console.log('bool: ' + test);
      if (test) {
        
        console.log('User is white listed');
        this.userAllowedText = 'User is white listed';
        //await this.keyCloakService.login();
        //this.router.navigate(['/guthabenVerwaltung']);
      }
    }
    // await this.keyCloakService.logout().then(() => {
    //   console.log('User is not white listed');
      this.userAllowedText = 'User is not white listed';
    //   this.keyCloakService.clearToken();
    // });
  }

  public async accessAuthentication(keycloakServiceLocal: KeycloakService): Promise<void> {
    const localWhiteListService: WhiteListServiceService = inject(WhiteListServiceService);
    console.log('UserInWhitelistComponent.ngOnInit()');
    const leoUser: LeoUser = await createLeoUser(this.keyCloakService);
    if (!(leoUser.username === null)) {
      console.log('User is not null');
      let test = await localWhiteListService.checkIfUserIsWhiteListed("leoUser.username");
      console.log('bool: ' + test);
      if (test) {
        
        console.log('User is white listed');
        this.userAllowedText = 'User is white listed';
        //await this.keyCloakService.login();
        //this.router.navigate(['/guthabenVerwaltung']);
      }
    }
    // await this.keyCloakService.logout().then(() => {
    //   console.log('User is not white listed');
      this.userAllowedText = 'User is not white listed';
    //   this.keyCloakService.clearToken();
    // });
  }
  
  private async checkIfUserIsWhiteListed(usernameLeoUser: string): Promise<boolean> {
    let isUserWhiteListed = this.whiteListService.checkIfUserIsWhiteListed(usernameLeoUser);
    console.log('isUserWhiteListed: ' + isUserWhiteListed);
    return isUserWhiteListed;
  }
}


