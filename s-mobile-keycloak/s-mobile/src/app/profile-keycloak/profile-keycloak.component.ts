import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { createLeoUser, LeoUser, Role } from '../../core/util/leo-token';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import { HttpClient } from '@angular/common/http';
import { StudentService } from '../service/student.service';
import { Router } from '@angular/router';
import { Student } from '../model/student';
import { lastValueFrom } from 'rxjs';


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
export class ProfileKeycloakComponent implements OnInit {
  private readonly keyCloakService: KeycloakService = inject(KeycloakService);
  public readonly userName: WritableSignal<string | null> = signal(null); 
  public readonly fullName: WritableSignal<string | null> = signal(null);
  public leoUserRole: WritableSignal<string | null> = signal(null);
  public strQrCodeData: string = ""
  //public valueTest = "";
  //public amountOfMoney = 0;

  public generateQrCodeButton: boolean = false;
  public className: string = ""

  constructor (private client: HttpClient, 
    public studentService: StudentService,
    private router: Router) {
    this.accessAuth()
  }
  //example variables
  public userCredit: number = 0;

  async ngOnInit(){
    const user: LeoUser = await createLeoUser(this.keyCloakService);
    this.getFullName(user);
    this.getRole(user);
    this.getUsername(user);
    this.getBalance();
    this.getClass();
  }

  private async accessAuth(){
    const user: LeoUser = await createLeoUser(this.keyCloakService);
    const studentId = user.username ? user.username.toString().replace(/\[Signal: (.*)\]/, "$1") : '';
    let request = this.studentService.getStudentDataById(studentId);
    let student: Student = await lastValueFrom(request);
    let classNumber: number = Number(student.studentClass[0])

    if(classNumber < 3) {
      console.log("not passed")
      let result = await this.logout();
    }

    console.log("student passed")
  }
  
  public generateQrCode(): string {
    const studentId = this.userName.toString().replace(/\[Signal: (.*)\]/, "$1");
    console.log("Qr-Code: ", studentId)
    return studentId;
  }

  public async getClass(){
    const studentId = this.userName.toString().replace(/\[Signal: (.*)\]/, "$1");
    let request = this.studentService.getStudentDataById(studentId);
    let student: Student = await lastValueFrom(request);
    console.log(student)
    this.className = student.studentClass;

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
    await this.keyCloakService.logout().then(() => {
      this.keyCloakService.clearToken();
    })
    this.router.navigate(['/']);
  }

  public async getBalance() {
    const studentId = this.userName.toString().replace(/\[Signal: (.*)\]/, "$1");
    console.log(studentId);
    // this.valueTest = studentId
    // this.studentService.getStudentBalanceById(studentId).subscribe(balance => {
    //    this.amountOfMoney = balance;
    //    this.qrCodeData.set(`${studentId}-${balance}`);
    //  });
    
      /*this.studentService.getStudentBalanceById(studentId).subscribe(balance => {
        this.amountOfMoney = balance;
      });*/
    await this.studentService.getStudentBalance(studentId).subscribe(balance => {
      this.userCredit = balance;
    })
    console.log(this.userCredit);
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