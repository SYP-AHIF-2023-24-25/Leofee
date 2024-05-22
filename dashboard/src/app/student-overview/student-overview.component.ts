import { Component } from '@angular/core';
import { Student, StudentBalance } from '../model/student';
import { DataService } from 'src/services/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-student-overview',
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.css']
})
export class StudentOverviewComponent {

  _students: Student[] = [];
  _studentsWithBalance: StudentBalance[] = [];
  _selectedFile: File | null = null;
  


  constructor(public dataService: DataService,
    public dialog: MatDialog
  ) {
  }

 async ngOnInit() {
  
    this._students = await this.dataService.getAllStudents();

    this._students.forEach(async student => {
      let studentBalance = await this.getBalanceForStudent(student.studentId);
      this._studentsWithBalance.push({student: student, balance: studentBalance });
    });


    
    console.log(this._students);   
  }

  AddStudent(){
    this.dialog.open(AddStudentDialog, {
      width: '400px',
      height: '400px'      
    });
    
  }

  async getBalanceForStudent(id: string): Promise<number>{
    let balance = await this.dataService.getBalanceForStudent(id);
    console.log(balance);
    return balance;
   
  }
  


  onFileSelected(event: any) {
    this._selectedFile = event.target.files[0];
  }

  async importStudents() {
    if (this._selectedFile) {
      const reader = new FileReader();

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const fileContent = reader.result as string;
        let lines = fileContent.split('\n');
        console.log(lines);
        for (let i = 1; i < lines.length; i++) {
          let parts: string[] = lines[i].split(';');
          if (parts.length === 4) {
            let student: Student = {
              studentId: parts[0],
              firstName: parts[1],
              lastName: parts[2],
              studentClass: parts[3],
            };

            if (this._students.find(s => s.studentId === student.studentId)) {
              console.log('Student bereits vorhanden');
            } else {
              await this.dataService.addStudent(student);
            }
          } else {
            console.warn(`Invalid line format: ${lines[i]}`);
          }
        }

        location.reload();
      };

      reader.readAsText(this._selectedFile);
    }
  }


  test(){
    console.log('test');
  }
  async deleteStudentFromList(lastName:string, firstName:string){
    
    const index = this._students.findIndex(
      student => student.firstName === firstName && student.lastName === lastName
    );
    if (index !== -1) {
      // Wenn der Student gefunden wurde, entferne ihn aus dem Array
      //this._students.splice(index, 1);
      await this.dataService.deleteStudent(this._students[index].studentId);
      location.reload();
    }
  

  }
  onFilterChange(event: any) {
    
    // Diese Methode wird aufgerufen, wenn sich die Auswahl im Dropdown ändert
    console.log('Auswahl geändert:', event.value);
    if(event.value === 'lastname'){
      this._students.sort((a, b) => a.firstName.localeCompare(b.lastName));
    }
    else if(event.value === 'class'){
      this._students.sort((a, b) => a.studentClass.localeCompare(b.studentClass));
    }   
  }

  deleteAllStudents(){
    this._students.forEach(async student => {
      await this.dataService.deleteStudent(student.studentId);
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
  /*
  fetchStudentBalance(studentFirstname:string,studentLastname:string,studentPassword:string): number {
    ///====================
    let studentString:string = studentFirstname + studentLastname + studentPassword;
    let studentIdString:string = "";
    fetch(`http://localhost:5196/student/${studentString}/getId`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Fehler beim Laden des Kontostands: ${response.status}`);
        }
        return response.json();
      })
      .then(studentId => {
        // Hier kannst du mit dem erhaltenen Kontostand arbeiten
        
        studentIdString = studentId;
      })
      .catch(error => {
        console.error("Fehler beim Abrufen des Kontostands:", error);
        
      });
      // ====================
      if(studentIdString === ""){
        return 0;
      }
      fetch(`http://localhost:5196/student/${studentIdString}/balance`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Fehler beim Laden des Kontostands: ${response.status}`);
        }
        return response.json();
      })
      .then(balance => {
        // Hier kannst du mit dem erhaltenen Kontostand arbeiten
        return balance;
      })
      .catch(error => {
        console.error("Fehler beim Abrufen des Kontostands:", error);
      });
      return 0;

      

  }*/
  
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
    private dataService: DataService
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
      await this.dataService.addStudent(student)
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

