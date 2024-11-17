
import { Component, OnInit, Inject, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bons } from '../model/Bons';
import { Student } from '../model/student';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { SharedService } from 'src/services/shared.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { KeycloakService } from 'keycloak-angular';


@Component({
  selector: 'app-bon-management-for-student',
  templateUrl: './bon-management-for-student.component.html',
  styleUrls: ['./bon-management-for-student.component.css']
})
export class BonManagementForStudentComponent implements OnInit {

  studentId: string = "";
  bonsForStudent: Bons | null = null;
 // student: Student;


  constructor(private route: ActivatedRoute,
    public restService: RestService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private whiteListService: WhiteListServiceService,
  ) {
    const localKeycloakService: KeycloakService = inject(KeycloakService);
    sharedService.accessAuthShared(localKeycloakService, whiteListService);
  }


   async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.studentId = params.get('id') || ''
    });
    console.log(this.studentId);
    
    this.bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(this.studentId));
   


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
    private restService: RestService,
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
      await lastValueFrom(this.restService.addBonForStudent(this.data.studentId,this.studentForm.value.from,this.studentForm.value.to, this.studentForm.value.value ));
      this.dialogRef.close(this.studentForm.value);
      location.reload();
    }
  } 
}
