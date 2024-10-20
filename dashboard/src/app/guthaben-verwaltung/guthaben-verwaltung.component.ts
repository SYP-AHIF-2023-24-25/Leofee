import { Component, OnInit } from '@angular/core';
import { Student, StudentBalance } from '../model/student';	

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl  } from '@angular/forms';
import { Router } from '@angular/router';
import { BonManagementForStudentComponent } from '../bon-management-for-student/bon-management-for-student.component';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { Bons } from '../model/Bons';
import { SharedService } from 'src/services/shared.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-guthaben-verwaltung',
  templateUrl: './guthaben-verwaltung.component.html',
  styleUrls: ['./guthaben-verwaltung.component.css']
})
export class GuthabenVerwaltungComponent implements OnInit{

  _students: Student[] = []; 
  _activeBon?: Bons ; 
  isBonExpired: boolean = true;
  voucherForm: FormGroup;

  constructor(public restService: RestService,
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private whiteListService: WhiteListServiceService)  {
    this.voucherForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      hoehe: [0, [Validators.required, Validators.min(0.01)]],
      max: [0, [Validators.required, Validators.min(0.01)]], 
      ist: [0]
    }, { validators: this.dateRangeValidator }); // Custom validator für Datum  
  }  

  
 async ngOnInit() {  

  //Alle Studenten holen
  this._students = await lastValueFrom(this.restService.getStudents());

  //Gesamtsaldo aller Studenten berechnen
  let balanceAllStudents = 0;
  this._students.forEach(async student => {
    const value = await lastValueFrom(this.restService.getStudentUsedValue(student.studentId));
    balanceAllStudents += value;   
  });


  const bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(this._students[0].studentId));
  this._activeBon = bonsForStudent[0];
  
  const hoeheBons = this._activeBon.value + this._activeBon.usedValue;
  
  if (this._activeBon) {
    this.voucherForm.patchValue({
      from: this._activeBon.from || "",  // Ersetze validFrom mit dem entsprechenden Feldname
      to: this._activeBon.to || "",      // Ersetze validTo mit dem entsprechenden Feldname
      hoehe: hoeheBons|| 0, // Standardwert 2, falls nicht vorhanden
      max: hoeheBons * this._students.length|| 0,   // Standardwert 900, falls nicht vorhanden
      ist: balanceAllStudents || 0   // Standardwert 278, falls nicht vorhanden
    });

    this.checkBonExpiry();
  }
  // Überwache Änderungen des "from"-Wertes
  this.voucherForm.get('from')?.valueChanges.subscribe(() => {
    this.checkBonExpiry();
    this.voucherForm.updateValueAndValidity(); // Datum-Validierung erneut prüfen
  });

  
} 

checkBonExpiry() {
  const fromDate = new Date(this.voucherForm.get('from')?.value);
  const today = new Date();

  // Wenn das From-Datum in der Vergangenheit liegt, sind die Felder und der Button deaktiviert
  if (fromDate <= today) {
    this.isBonExpired = true;
    // Formularfelder deaktivieren   
    this.voucherForm.get('hoehe')?.disable();
    this.voucherForm.get('max')?.disable();
    this.voucherForm.get('ist')?.disable();
  } else {
    this.isBonExpired = false;

    // Falls es wieder bearbeitbar sein soll (beim Ändern), aktivieren wir die Felder   
    this.voucherForm.get('hoehe')?.enable();
    this.voucherForm.get('max')?.enable();
    this.voucherForm.get('ist')?.enable();
  }
}


  // Benutzerdefinierter Validator: "From"-Datum muss vor dem "To"-Datum liegen
  dateRangeValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    return from && to && new Date(from) > new Date(to) ? { dateRangeInvalid: true } : null;
  }

 // Dynamische Berechnung von 'max'
 get maxValue(): number {
  const hoehe = this.voucherForm.get('hoehe')?.value;
  return hoehe && this._students.length > 0 ? hoehe * this._students.length : 0;
}

// Dynamische Berechnung von 'hoehe', falls 'max' geändert wird
get hoeheValue(): number {
  const max = this.voucherForm.get('max')?.value;
  return max && this._students.length > 0 ? max / this._students.length : 0;
}


  // Formular absenden
  async onSubmit() {
    
    if (this.voucherForm.valid) {
      for (const student of this._students) {
        // Vorhandene Bons für den Schüler abrufen
        const bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(student.studentId));
        
        if (bonsForStudent.length > 0) {
          // Bon existiert -> Patch (Update)
          const existingBon = bonsForStudent[0];
          await lastValueFrom(this.restService.updateBonForStudent(
            existingBon.id,  // Hier müsste der korrekte Bon-ID Parameter hinzugefügt werden
            this.voucherForm.value.from,
            this.voucherForm.value.to,
            this.voucherForm.value.hoehe,
            0
          ));
          console.log(`Bon für Student ${student.studentId} wurde aktualisiert.`);
        } else {
          // Bon existiert nicht -> Post (Erstellen)
          await lastValueFrom(this.restService.addBonForStudent(
            student.studentId,
            this.voucherForm.value.from,
            this.voucherForm.value.to,
            this.voucherForm.value.hoehe
          ));
          console.log(`Neuer Bon für Student ${student.studentId} wurde erstellt.`);
        }
      }    
    } else {
      console.log('Form invalid');
    }
  }
}

