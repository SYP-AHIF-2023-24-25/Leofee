import { Component, OnInit,Inject } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RestService } from 'src/services/rest.service';
import { Student } from '../model/student';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedService } from 'src/services/shared.service';
import { KeycloakService } from 'keycloak-angular';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements OnInit{
  student: Student|undefined;
  balance: number|undefined;
  usedValue: number|undefined = 0;
  isLoading: boolean = true;
  sharedService: SharedService | undefined;
 
  /*
  constructor(private route: ActivatedRoute, private router: Router,public restService: RestService,
    sharedService: SharedService,
    keyCloakService: KeycloakService,
    public dialogRef: MatDialogRef<StudentDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { studentId: string },
    whiteListService: WhiteListServiceService
  ) {
   sharedService.accessAuthShared(keyCloakService, whiteListService);
    
  }

  */
  
  constructor( public restService: RestService,    
    public dialogRef: MatDialogRef<StudentDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { studentId: string },    
  ) {

  }

  async ngOnInit() { 
    
    const studentIdString = this.data.studentId;  
    console.log(studentIdString);  
    if (studentIdString) {                                      
      this.student = await this.getStudentById(studentIdString);      
      this.balance = await this.getStudentBalance(studentIdString);
      console.log(this.balance);
      this.usedValue = await this.getStudentUsedValue(studentIdString);
    }
    
    this.isLoading = false;
  } 
  async getStudentById(id: string): Promise<Student> {
    try {
      return await lastValueFrom(this.restService.getStudentWithID(id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  }
  async getStudentBalance(id: string): Promise<number> {
    try {
      return await lastValueFrom(this.restService.getStudentBalance(id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  }
  async getStudentUsedValue(id: string): Promise<number> {
    try {
      return await lastValueFrom(this.restService.getStudentUsedValue(id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  }
  async deleteStudentFromList() { 
    if (this.student) {
      await lastValueFrom(this.restService.deleteStudent(this.student.studentId));
      this.dialogRef.close(); // Dialog schließen
    }
  }

  onNoClick(): void {
    this.dialogRef.close(); 
  }
}
