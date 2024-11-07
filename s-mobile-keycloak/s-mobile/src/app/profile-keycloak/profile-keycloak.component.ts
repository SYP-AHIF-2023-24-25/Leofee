import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { createLeoUser, LeoUser, Role } from '../../core/util/leo-token';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import { HttpClient } from '@angular/common/http';
import { StudentService } from '../service/student.service';
import { Router } from '@angular/router';

// COMPONENT IS ONLY FOR TESTING PURPOSES
// SOMETHINGS WILL LATER BE WRITTEN ON THE GIFT-CARD COMPONENT
@Component({
  selector: 'app-profile-keycloak',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    QRCodeModule
  ],
  templateUrl: './profile-keycloak.component.html',
  styleUrl: './profile-keycloak.component.css'
})
export class ProfileKeycloakComponent {
  private readonly keycloakService: KeycloakService = inject(KeycloakService);
  public readonly userName: WritableSignal<string | null> = signal(null);
  public readonly fullName: WritableSignal<string | null> = signal(null);
  public leoUserRole: WritableSignal<string | null> = signal(null);
  public readonly qrCodeData: WritableSignal<string> = signal("");
  public anotherQrCodeData: string = ""
  public valueTest = "";
  public amountOfMoney = 0;
  public generateQrCodeButton: boolean = false;

  constructor (private client: HttpClient, private router: Router, private studentService: StudentService) {
  }

  //example variables
  public userCredit: number = 0;

  async ngOnInit(): Promise<void> {
    const user: LeoUser = await createLeoUser(this.keycloakService);
    this.getFullName(user);
    this.getRole(user);
    this.getUsername(user);
    this.loadStudentData();
  }

  public generateQRCode() {
    this.anotherQrCodeData = `${this.userName}`;
    return this.anotherQrCodeData;
  }

  public async getFullName(user: LeoUser): Promise<void> {
    this.fullName.set(user.fullName);
  }

  public async getRole(user: LeoUser): Promise<void> {
    this.leoUserRole.set(user.roleAsString);
  }

  public async getUsername(user: LeoUser): Promise<void> {
    this.userName.set(user.username);
  }

  public async logout(): Promise<void> {
    await this.keycloakService.logout();
    this.router.navigate(['/login'])
  }

  public async loadStudentData() {
    const studentId = this.userName.toString().replace(/\[Signal: (.*)\]/, "$1");
    console.log(studentId);
    this.valueTest = studentId
    // this.studentService.getStudentBalanceById(studentId).subscribe(balance => {
    //    this.amountOfMoney = balance;
    //    this.qrCodeData.set(`${studentId}-${balance}`);
    //  });
    
      /*this.studentService.getStudentBalanceById(studentId).subscribe(balance => {
        this.amountOfMoney = balance;
      });*/
      console.log(studentId)


    this.userCredit = await this.studentService.getBalanceForStudent(studentId);
    

    this.qrCodeData.set(`${studentId}`);

  }

  public async clickOnQrCodeButton() {
    if (this.generateQrCodeButton) {
      this.generateQrCodeButton = false;
    } else {
      this.generateQrCodeButton = true;
    }
    console.log(this.generateQrCodeButton);
  }
}