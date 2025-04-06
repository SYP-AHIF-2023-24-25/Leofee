import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
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
  imports: [CommonModule, NgbModule, QRCodeModule],
  templateUrl: './profile-keycloak.component.html',
  styleUrl: './profile-keycloak.component.css',
})
export class ProfileKeycloakComponent implements OnInit {
  private readonly keyCloakService: KeycloakService = inject(KeycloakService);
  public readonly userName: WritableSignal<string | null> = signal(null);
  public readonly fullName: WritableSignal<string | null> = signal(null);
  public leoUserRole: WritableSignal<string | null> = signal(null);
  public strQrCodeData: string = '';

  public generateQrCodeButton: boolean = false;
  public className: string = '';

  constructor(
    private client: HttpClient,
    public studentService: StudentService,
    private router: Router,
  ) {
    this.accessAuth();
  }
  //example variables
  public userCredit: number = 0;

  async ngOnInit() {
    const user: LeoUser = await createLeoUser(this.keyCloakService);
    this.userName.set(user.username);
    this.fullName.set(user.fullName);
    this.leoUserRole.set(user.roleAsString);
    this.loadBalance();
    this.loadClass();
  }

  private async accessAuth() {
    const user: LeoUser = await createLeoUser(this.keyCloakService);
    const studentId = user.username
      ? user.username.toString().replace(/\[Signal: (.*)\]/, '$1')
      : '';
    let request = this.studentService.getStudentDataById(studentId);
    let student: Student = await lastValueFrom(request);
    let classNumber: number = Number(student.studentClass[0]);

    if (classNumber < 3) {
      let result = await this.logout();
    }
  }

  public generateQrCode(): string {
    const studentId = this.userName();
    if (studentId == null) {
      return '';
    }
    return studentId;
  }

  public async loadClass() {
    const studentId = this.userName();
    if (studentId == null) {
      return;
    }
    let request = this.studentService.getStudentDataById(studentId);
    let student: Student = await lastValueFrom(request);
    this.className = student.studentClass;
  }

  public async getFullName(user: LeoUser): Promise<void> {
    this.fullName.set(user.fullName);
  }

  public async getRole(user: LeoUser): Promise<void> {
    this.leoUserRole.set(user.roleAsString);
  }

  public getUsername(user: LeoUser) {
    this.userName.set(user.username);
  }

  public async logout(): Promise<void> {
    await this.keyCloakService.logout().then(() => {
      this.keyCloakService.clearToken();
    });
    //this.router.navigate(['/']);
  }

  public loadBalance() {
    const studentId = this.userName();

    if (studentId == null) {
      return;
    }
    this.studentService.getStudentBalance(studentId).subscribe((balance) => {
      this.userCredit = balance;
    });
  }

  public async clickOnQrCodeButton() {
    if (this.generateQrCodeButton) {
      this.generateQrCodeButton = false;
    } else {
      this.generateQrCodeButton = true;
    }
  }
}
