
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/services/data.service';
import { Bons } from '../model/Bons';
import { Student } from '../model/student';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-bon-management-for-student',
  templateUrl: './bon-management-for-student.component.html',
  styleUrls: ['./bon-management-for-student.component.css']
})
export class BonManagementForStudentComponent implements OnInit {

  studentId: string = "";
  bonsForStudent: Bons[] = [];
 // student: Student;


  constructor(private route: ActivatedRoute,
    public dataService: DataService,
    public dialog: MatDialog
  ) {}


   async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.studentId = params.get('id') || ''
    });
    console.log(this.studentId);
    
    await this.dataService.getBonsForStudent(this.studentId).then(bons => {
      this.bonsForStudent = bons;
    }); 


  }

  public AddBon(){
    this.dialog.open(AddBonForStudentDialog, {
      width: '400px',
      height: '400px',
      data: {studentId: this.studentId}
     
    });
  }

}



@Component({
  selector: 'app-bon-management-for-student',
  templateUrl: './AddBonForStudentDialog.html',
})
export class AddBonForStudentDialog {  
  studentForm: FormGroup;
  studentId: string = "";

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBonForStudentDialog>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.studentForm = this.fb.group({
      //studentId: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      value: [0, Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onSubmit(): Promise<void> {
    if (this.studentForm.valid) {
      console.log(this.studentForm.value);
      //TODO
      await this.dataService.addBonForStudent(this.data.studentId,this.studentForm.value.from,this.studentForm.value.to, this.studentForm.value.value);
      this.dialogRef.close(this.studentForm.value);
      location.reload();
    }
  } 
}
