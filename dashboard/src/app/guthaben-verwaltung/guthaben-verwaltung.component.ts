import { Component } from '@angular/core';
import { Student, StudentBalance } from '../model/student';	
import { DataService } from 'src/services/data.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BonManagementForStudentComponent } from '../bon-management-for-student/bon-management-for-student.component';

@Component({
  selector: 'app-guthaben-verwaltung',
  templateUrl: './guthaben-verwaltung.component.html',
  styleUrls: ['./guthaben-verwaltung.component.css']
})
export class GuthabenVerwaltungComponent {

  _students: Student[] = [];
  _studentsWithBalance: StudentBalance[] = []; 
  



  constructor(public dataService: DataService,
    public dialog: MatDialog,
    private router: Router
  ) {
  }


  ShowDetails(id: string){
    this.router.navigate(['/bonManagementForStudent', id]);  
  }

 async ngOnInit() {
  
    this._students = await this.dataService.getAllStudents();

    this._students.forEach(async student => {
      let studentBalance = await this.getBalanceForStudent(student.studentId) ;
      this._studentsWithBalance.push({student: student, balance: studentBalance });
    });
    console.log(this._students);   
  }

 

  async getBalanceForStudent(id: string): Promise<number>{
    let balance = await this.dataService.getBalanceForStudent(id);
    console.log(balance);
    return balance;   
  }
}

