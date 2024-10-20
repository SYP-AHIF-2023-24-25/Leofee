import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { createLeoUser, LeoUser } from 'src/core/util/leo-token';
import { WhiteListServiceService } from 'src/services/white-list-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dashboard';

  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  private router: Router = inject(Router);
  whiteListService: any;
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

  // async ngOnInit() {
  //   console.log('whiteList ins app.component.ts');
  //   let whiteListService: WhiteListServiceService = inject(WhiteListServiceService);
  //   const leoUser: LeoUser = await createLeoUser(this.keycloakService);
  //   if (!(leoUser.username === null)) {
  //     console.log('User is not null');
  //     let test = await this.whiteListService.checkIfUserIsWhiteListed("leoUser.username");
  //     console.log('bool: ' + test);
  //     if (test) {
        
  //       console.log('User is white listed');
  //       //await this.keyCloakService.login();
  //       this.router.navigate(['/guthabenVerwaltung']);
  //     }
  //   }
  //   await this.keycloakService.logout().then(() => {
  //     console.log('User is not white listed');
  //     this.keycloakService.clearToken();
  //   });
}
