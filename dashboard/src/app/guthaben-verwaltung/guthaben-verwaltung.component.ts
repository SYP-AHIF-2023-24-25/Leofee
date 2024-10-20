import { Component, inject } from '@angular/core';
import { Student, StudentBalance } from '../model/student';	

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BonManagementForStudentComponent } from '../bon-management-for-student/bon-management-for-student.component';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { SharedService } from 'src/services/shared.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-guthaben-verwaltung',
  templateUrl: './guthaben-verwaltung.component.html',
  styleUrls: ['./guthaben-verwaltung.component.css']
})
export class GuthabenVerwaltungComponent {

  _students: Student[] = [];
  _studentsWithBalance: StudentBalance[] = []; 

  constructor(public restService: RestService,
    public dialog: MatDialog,
    private router: Router,
    private sharedService: SharedService,
    private whiteListService: WhiteListServiceService) {
      const localKeycloakService: KeycloakService = inject(KeycloakService);
      sharedService.accessAuthShared(localKeycloakService, whiteListService);
    }


  ShowDetails(id: string){
    this.router.navigate(['/bonManagementForStudent', id]);  
  }

 async ngOnInit() {
  
    this._students = await lastValueFrom(this.restService.getStudents());

    this._students.forEach(async student => {
      let studentBalance = await this.getBalanceForStudent(student.studentId) ;
      this._studentsWithBalance.push({student: student, balance: studentBalance });
    });
    console.log(this._students);
  }

 

  async getBalanceForStudent(id: string): Promise<number>{
    let balance = await lastValueFrom(this.restService.getStudentBalance(id));
    console.log(balance);
    return balance;   
  }
}

