import { FormsModule, NgModel } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { WhiteListUser } from '../model/white-list-user';
import { RestService } from 'src/services/rest.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { SharedService } from 'src/services/shared.service';

@Component({
  selector: 'app-user-managment',
  templateUrl: './user-managment.component.html',
  styleUrl: './user-managment.component.css'
})
export class UserManagementComponent {
  deleteUserId: string = '';
  userIdInput: string = '';
  firstNameInput: string = '';
  lastNameInput: string = '';

  _whiteListUsers: WhiteListUser[] = [];

  constructor(public whiteListService: WhiteListServiceService, private sharedService: SharedService) {
    const localKeycloakService: KeycloakService = inject(KeycloakService);
    sharedService.accessAuthShared(localKeycloakService, whiteListService);
  }

  async ngOnInit() {
    this._whiteListUsers = await lastValueFrom(this.whiteListService.getAllWhiteListUsers());

    for (let i = 0; i < this._whiteListUsers.length; i++) {
      console.log(this._whiteListUsers[i]);
    }
  }

  async addUser() {
    let newUser: WhiteListUser = {
      userId: this.userIdInput,
      firstName: this.firstNameInput,
      lastName: this.lastNameInput
    }
    if (this.checkIfUserIsValid(newUser)){
      let msg = await this.whiteListService.addWhiteListUser(newUser)
      console.log(msg.subscribe({
        next: msg => console.log(msg),
        error: err => console.error('Observer got an error: ' + err),
        complete: () => this.ngOnInit()
      }));
      
    }

  }

  async deleteUser() {
    await this.whiteListService.deleteWhiteListUser(this.deleteUserId).subscribe({
      next: msg => console.log(msg),
      error: err => console.error('Observer got an error: ' + err),
      complete: () => this.ngOnInit()
    })
  }

  private checkIfUserIsValid(newUser: WhiteListUser): boolean {

    if (!(newUser.userId === '' && newUser.firstName === '' && newUser.lastName === '')) {
      console.log("User is valid");
      return true;
    }
    console.log("User is not valid");
    return false;
  }
}
