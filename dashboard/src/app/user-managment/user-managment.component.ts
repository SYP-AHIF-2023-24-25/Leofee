import { Component } from '@angular/core';
import { WhiteListUser } from '../model/white-list-user';
import { RestService } from 'src/services/rest.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';

@Component({
  selector: 'app-user-managment',
  standalone: true,
  imports: [],
  templateUrl: './user-managment.component.html',
  styleUrl: './user-managment.component.css'
})
export class UserManagmentComponent {
  userIdInput: string = '';
  firstNameInput: string = "";
  lastNameInput: string = "";

  _whiteListUsers: WhiteListUser[] = [];

  constructor(public whiteListService: WhiteListServiceService) {
  }

  async ngOnInit() {
    let oberserableValues = await this.whiteListService.getAllWhiteListUsers();
    let test = oberserableValues.subscribe({
      next: whiteListUsers => this._whiteListUsers = whiteListUsers,
      error: err => console.error('Observer got an error: ' + err),
      complete: () => console.log('Observer got a complete notification') 
    }) ;
  }

  async addUser(userId: string, firstName: string, lastName: string) {
    let newUser: WhiteListUser = {
      userId: userId,
      FirstName: firstName,
      LastName: lastName
    }
    await this.whiteListService.addWhiteListUser(newUser)
  }

  async deleteUse(userId: string) {
    await this.whiteListService.deleteWhiteListUser(userId);
  }

  private checkIfIdIsValid(userId: string) {
    if (userId.substring(0, 1).toLocaleLowerCase() == "if") {
      return true;
    }
    return false;
  }
}
