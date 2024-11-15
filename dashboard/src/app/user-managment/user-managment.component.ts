import { FormBuilder, FormGroup, FormsModule, NgModel, Validators } from '@angular/forms';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { WhiteListUser } from '../model/white-list-user';
import { RestService } from 'src/services/rest.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { last, lastValueFrom } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { SharedService } from 'src/services/shared.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogRef } from '@angular/cdk/dialog';


@Component({
  selector: 'app-user-managment',
  templateUrl: './user-managment.component.html',
  styleUrl: './user-managment.component.css'
})
export class UserManagementComponent implements OnInit{
  deleteUserId: string = '';
  userIdInput: string = '';
  firstNameInput: string = '';
  lastNameInput: string = '';

  _whiteListUsers: WhiteListUser[] = [];

  constructor(
    public whiteListService: WhiteListServiceService,
    private sharedService: SharedService, 
    private keyCloakService: KeycloakService,
    private addUserDialog: MatDialog) {

    sharedService.accessAuthShared(keyCloakService, whiteListService);
  }
  public async ngOnInit() {
    this.sharedService.accessAuthShared(this.keyCloakService, this.whiteListService);
    this._whiteListUsers = await lastValueFrom(this.whiteListService.getAllWhiteListUsers());
    for (let i = 0; i < this._whiteListUsers.length; i++) {
      console.log(this._whiteListUsers[i]);
    }
  }

  public addUser() {
    const dialogRef = this.addUserDialog.open(AddUserDialog, {
      width: "300px",
      height: "430px"
    });
    dialogRef.afterClosed().subscribe({
      next: msg => console.log(msg),
      error: err => console.log('Error: ' + err),
      complete: () => this.ngOnInit()
    });
  }

  async callDeleteUser(whiteListUser: any) {
    // create dialog
    const dialogRef = this.addUserDialog.open(ConfirmationWindow, {
      width: "200px",
      height: "200px",
      data: {title: 'Willst du diesen Benutzer wirklich löschen?'}
    });
    await dialogRef.afterClosed().subscribe(result => {
      if(result == true){
        this.deleteUserFromWhiteList(whiteListUser);
      }
    });
  }

  private async deleteUserFromWhiteList(whiteListUser: any){
    this.ngOnInit();
    await this.whiteListService.deleteWhiteListUser(whiteListUser.userId).subscribe({
      next: msg => console.log(msg),
      error: err => console.error('Observer got an error: ' + err),
      complete: () => this.ngOnInit()
    });
  }
}

@Component({
  selector: 'AddUserDialog',
  templateUrl: './AddUserDialog.html'
})
export class AddUserDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private matDialog: MatDialogRef<AddUserDialog>,
    private whiteListService: WhiteListServiceService,
    private sharedService: SharedService
  ) {
    this.form = this.fb.group({
      userId: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      firstName: ['', [Validators.minLength(2)]],
      lastName: ['', [Validators.minLength(2)]]
    })
    const keycloakService: KeycloakService = inject(KeycloakService);
    this.sharedService.accessAuthShared(keycloakService, whiteListService)
  }

  public async addUserInDialog() {
    let newUser: WhiteListUser = {
      userId: this.form.value.userId,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName
    }
    if(this.form.valid){
      this.accessChecker()
      await this.whiteListService.addWhiteListUser(newUser).subscribe({
        next: msg => console.log(msg),
        error: err => console.error('Observer got an error: ' + err),
        complete: () => this.matDialog.close(newUser)
      });
    }
  }
  private accessChecker(){
    const keycloakService: KeycloakService = inject(KeycloakService);
    this.sharedService.accessAuthShared(keycloakService, this.whiteListService);
  }
  public closeDialog(){
    // let result: boolean = this.callConfirmationDialog('Willst du das Benutzer-hinzufügen Fenster wirklich verlassen?');
    // if(result) {
    //   this.matDialog.close();
    // }
    this.matDialog.close();
  }

  // private callConfirmationDialog(title: string): boolean {
  //   const confirmationDialog: MatDialog = Inject(MatDialog);
  //   const dialogRef = confirmationDialog.open(ConfirmationWindow, {
  //     width : "500px",
  //     height: "200px",
  //     data: {title: 'Willst diesen Benutzer wirklich hinzufügen?'}
  //   });
  //   let userResult: boolean = false;
  //   dialogRef.afterClosed().subscribe(result => {
  //     userResult = result;
  //     console.log(result);
  //   });
  //   return userResult;
  // }
}

@Component({
  selector: 'ConfirmationWindow',
  templateUrl: './ConfirmationWindow.html'
})
export class ConfirmationWindow {
  constructor(
    private privateDialogRef: MatDialogRef<ConfirmationWindow>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }){
  }

  public decline(){
    let result: boolean = false;
    this.privateDialogRef.close(result);
  }

  public accept(){
    let result: boolean = true;
    this.privateDialogRef.close(result);
  }
}