import { FormsModule, NgModel } from '@angular/forms';
import { Component } from '@angular/core';
import { WhiteListUser } from '../model/white-list-user';
import { RestService } from 'src/services/rest.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-managment',
  templateUrl: './user-managment.component.html',
  styleUrl: './user-managment.component.css'
})
export class UserManagementComponent {
  userIdInput: string = '';
  firstNameInput: string = '';
  lastNameInput: string = '';

  _whiteListUsers: WhiteListUser[] = [];

  constructor(public whiteListService: WhiteListServiceService) {
  }

  async ngOnInit() {
    this._whiteListUsers = await lastValueFrom(this.whiteListService.getAllWhiteListUsers());
    // let oberserableValues = await this.whiteListService.getAllWhiteListUsers();
    // let test = oberserableValues.subscribe({
    //   next: whiteListUsers => this._whiteListUsers = whiteListUsers,
    //   error: err => console.error('Observer got an error: ' + err),
    //   complete: () => console.log('Observer got a complete notification') 
    // }) ;

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

  async deleteUser(userId: string) {
    await this.whiteListService.deleteWhiteListUser(userId);
  }

  private checkIfUserIsValid(newUser: WhiteListUser): boolean {
    // if (new.substring(0, 1).toLocaleLowerCase() == "if") {
    //   return true;
    // }
    // return false;

    if (!(newUser.userId === '' && newUser.firstName === '' && newUser.lastName === '')) {
      console.log("User is valid");
      return true;
    }
    console.log("User is not valid");
    return false;
  }
}
