import { Component, inject } from '@angular/core';
import { Student, StudentBalance } from '../model/student';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { KeycloakService } from 'keycloak-angular';
import { SharedService } from 'src/services/shared.service';


@Component({
  selector: 'app-student-overview',
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.css']
})
export class StudentOverviewComponent {

  _students: Student[] = [];
  _studentsWithBalance: StudentBalance[] = [];
  _selectedFile: File | null = null;
  


  constructor(public restService: RestService,
    public dialog: MatDialog, private whiteListService: WhiteListServiceService, 
    private sharedService: SharedService) {
      const localKeycloakService: KeycloakService = inject(KeycloakService);
      sharedService.accessAuthShared(localKeycloakService, whiteListService);
    }

 async ngOnInit() {
 
    this._students = await lastValueFrom(this.restService.getStudents());

  
   

    this._students.forEach(async student => {
      let studentBalance = await this.getBalanceForStudent(student.studentId);
      this._studentsWithBalance.push({student: student, balance: studentBalance });
    });


    
    console.log(this._students);   
  }

  AddStudent(){
    this.dialog.open(AddStudentDialog, {
      width: '400px',
      height: '450px'      
    });
    
  }

  async getBalanceForStudent(id: string): Promise<number>{

   let balance = await lastValueFrom(this.restService.getStudentBalance(id));
    
    return balance;
    
   
  }
  


 
  importStudents(): void {


 
    const dialogRef = this.dialog.open(ImportDialog, {
      width: '450px',
      height: '240px'
    });  

    dialogRef.afterClosed().subscribe(result => {     
       location.reload();
    });

     

    
  }


  async deleteStudentFromList(lastName:string, firstName:string){
    
    const index = this._students.findIndex(
      student => student.firstName === firstName && student.lastName === lastName
    );
    if (index !== -1) {
      
      await lastValueFrom(this.restService.deleteStudent(this._students[index].studentId));
      location.reload();
    }
  

  }
  onFilterChange(event: any) {   
    console.log('Auswahl geändert:', event.value);
    if (event.value === 'lastname') {
      this._studentsWithBalance.sort((a, b) => a.student.lastName.localeCompare(b.student.lastName));
    } else if (event.value === 'class') {
      this._studentsWithBalance.sort((a, b) => a.student.studentClass.localeCompare(b.student.studentClass));
    }
    
  }

  deleteAllStudents(){
    this._students.forEach(async student => {
      await lastValueFrom(this.restService.deleteStudent(student.studentId));
    });
    location.reload();
  }

  exportToCSV(): void {
    
    if (this._students.length === 0) {
      console.log('Keine Daten zum Exportieren vorhanden.');
      return;
    }
    const csvHeader = 'Firstname;Lastname;Class\n';
    const csvRows = this._students.map(student => `${student.firstName};${student.lastName};${student.studentClass}`).join('\n');
    const csvContent = `${csvHeader}${csvRows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Daten wurden erfolgreich exportiert.');
  }
  exportToPDF(): void {
    if (this._students.length === 0) {
      console.log('Keine Daten zum Exportieren vorhanden.');
      return;
    }

    // Erstelle einen HTML-String für den PDF-Inhalt
    const pdfContent = `
      <html>
        <head>
          <title>Studentenliste</title>
        </head>
        <body>
          <h1>Studentenliste</h1>
          <table border="1">
            <thead>
              <tr>
                <th>Firstname</th>
                <th>Lastname</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              ${this._students.map(student => `
                <tr>
                  <td>${student.firstName}</td>
                  <td>${student.lastName}</td>
                  <td>${student.studentClass}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    console.log('Daten wurden erfolgreich als PDF exportiert.');
  }
}


@Component({
  selector: 'AddStudentDialog',
  templateUrl: './AddStudentDialog.html',
})
export class AddStudentDialog{    
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddStudentDialog>,
    private restService: RestService
  ) {
    this.form = this.fb.group({
      IFnummer: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      vorname: ['', Validators.required],
      nachname: ['', Validators.required],
      klasse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]]
    });
  }

  async save() {
    if (this.form.valid) {
      console.log(this.form.value);
      let student: Student = {
        studentId: this.form.value.IFnummer,
        firstName: this.form.value.vorname,
        lastName: this.form.value.nachname,
        studentClass: this.form.value.klasse
      };

      await lastValueFrom(this.restService.addStudent(student));
      this.dialogRef.close(this.form.value);
      location.reload();
    }
  }
  close() {
    this.dialogRef.close();
  }  
  clicked(){
    this.dialogRef.close();
  }  
}


@Component({
  selector: 'ImportDialog',
  templateUrl: './ImportDialog.html',
})
export class ImportDialog{
  
  _selectedFile: File | null = null;
  _students: Student[] = [];
  amount: number=0;


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddStudentDialog>,
    private restService: RestService,
    
  ) {
    
    
  }

  onFileSelected(event: any) {
    this._selectedFile = event.target.files[0];
  } 


  async importStudent(){

    //students von der Datenbank holen
    this._students = await lastValueFrom(this.restService.getStudents());

    //File auslesen und Students machen
    if (this._selectedFile) {
      const reader = new FileReader();

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const fileContent = reader.result as string;
        let lines = fileContent.split('\n');
        console.log(lines);
        for (let i = 0; i < lines.length; i++) {
          let parts: string[] = lines[i].split(';');
          if (parts.length === 4) {
            let student: Student = {
              studentId: parts[0],
              firstName: parts[1],
              lastName: parts[2],
              studentClass: parts[3],
            };
            
            //Ist der Schüler schon vorhanden?
            if (this._students.find(s => s.studentId === student.studentId)) {
              console.log('Student bereits vorhanden');
              
            } else {
              //Nein => ab in die Datenbank
              console.log(student.firstName);
              await lastValueFrom(this.restService.addStudent(student));

              //Betrag zu den Schülern hinzufügen
              const from = new Date();
              const to = new Date();
              to.setDate(from.getDate() + 14);

              console.log(this.amount);              
              await lastValueFrom(this.restService.addBonForStudent(student.studentId, from, to, this.amount));
             
            }
          } else {
            console.warn(`Invalid line format: ${lines[i]}`);
          }
        }
      };
      reader.readAsText(this._selectedFile);  
      
     
    }


    //this.dialogRef.close(); 
  }
  validateAmount() {
    if (this.amount < 0) {
        this.amount = 0;
    }
  }

  close(): void {
    
    this.dialogRef.close(); 
      
  }
}

