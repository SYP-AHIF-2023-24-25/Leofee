import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { WhiteListServiceService } from './white-list-service.service';
import { createLeoUser, LeoUser } from 'src/core/util/leo-token';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  public async accessAuthShared(keycloakServiceLocal: KeycloakService, whiteListService: WhiteListServiceService): Promise<void> {
    console.log('SharedService.accessAuthShared()');
    const leoUser: LeoUser = await createLeoUser(keycloakServiceLocal);
    if (!(leoUser.username === null)) {
      console.log('User is not null');
      let test = await whiteListService.checkIfUserIsWhiteListed(leoUser.username);
      console.log('bool: ' + test);
      if (test) {
        
        console.log('User is white listed');
        //await this.keyCloakService.login();
        //this.router.navigate(['/guthabenVerwaltung']);
        return;
      }
    }
    keycloakServiceLocal.logout().then(() => {
      console.log('User is not white listed');
      keycloakServiceLocal.clearToken();
    });
    return;
  }
}