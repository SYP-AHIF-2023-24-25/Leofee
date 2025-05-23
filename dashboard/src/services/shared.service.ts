import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { WhiteListServiceService } from './white-list-service.service';
import { createLeoUser, LeoUser } from 'src/core/util/leo-token';
import { WhiteListUser } from 'src/app/model/white-list-user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private router: Router) { }
  
  public async accessAuthShared(keycloakServiceLocal: KeycloakService, whiteListService: WhiteListServiceService): Promise<boolean> {
    console.log('SharedService.accessAuthShared()');
 
    const leoUser: LeoUser = await createLeoUser(keycloakServiceLocal);
    if (!(leoUser.username === null)) {
      console.log('User is not null');
      let isUserInWhiteList = await whiteListService.checkIfUserIsWhiteListed(leoUser.username);
      console.log('bool: ' + isUserInWhiteList);
      if (isUserInWhiteList) {
        
        console.log('User is white listed');
        //await this.keyCloakService.login();
        //this.router.navigate(['/guthabenVerwaltung']);
        return true;
      }
    }

    this.router.navigate(['/not-allowed-page']);
    // keycloakServiceLocal.logout().then(() => {
    //   console.log('User is not white listed');
    //   keycloakServiceLocal.clearToken();
      
    // });   


    return false;
  }
}
