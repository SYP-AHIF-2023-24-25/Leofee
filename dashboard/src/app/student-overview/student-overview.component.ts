import { Component, OnInit,ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student, StudentWithBalance } from '../model/student';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { MatSort,Sort } from '@angular/material/sort';
import { SharedService } from 'src/services/shared.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { KeycloakService } from 'keycloak-angular';
import { StudentDetailComponent } from '../student-detail/student-detail.component';
import{MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-student-overview',
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.css']
})
export class StudentOverviewComponent implements OnInit {
  displayedColumns: string[] = ['firstName', 'lastName', 'balance', 'studentClass', 'details'];
  filteredStudents: MatTableDataSource<any> = new MatTableDataSource();
  _students: StudentWithBalance[] = [];
  _studentsWithBalance: any[] = [];
  _selectedFile: File | null = null;
  isLoading: boolean = false;
  selectedFilters:string[] = [];

  dataSource = new MatTableDataSource(this._students);


@ViewChild(MatSort) sort!: MatSort;
@ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(public restService: RestService, public dialog: MatDialog, private router: Router) {}

  async ngOnInit() {
    this._students = await lastValueFrom(this.restService.getStudentsWithBalance());
    /*this._studentsWithBalance = await Promise.all(this._students.map(async student => {
      const balance = await this.getBalanceForStudent(student.studentId);
      return { student, balance };
    }));*/
    this.filteredStudents.data = this._students; // Daten zuweisen
    this.filteredStudents.sort = this.sort;
    this.filteredStudents.paginator = this.paginator;
    console.log(this._students);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredStudents.filter = filterValue.trim().toLowerCase();
  }

  async getBalanceForStudent(studentId: string): Promise<number> {
    return await lastValueFrom(this.restService.getStudentBalance(studentId));
  }

  viewDetails(firstName: string, lastName: string) {
    const student = this.filteredStudents.data.find(entry => entry.firstName === firstName && entry.lastName === lastName);
    
    if (student) {      
      console.log(student.studentID);
      const dialogRef = this.dialog.open(StudentDetailComponent, {
        width: '400px',
        data: { studentId: student.studentID },
        backdropClass: 'custom-dialog-backdrop' // Custom backdrop class
      });
      dialogRef.afterClosed().subscribe(() => {
        location.reload();
      });
    }
  }

  AddStudent() {
    this.dialog.open(AddStudentDialog, {
      width: '400px',
      height: '450px'
    });
  }

  onFileSelected(event: any) {
    this._selectedFile = event.target.files[0];
  }

  async exportToCSV() {
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

  async exportToPDF() {
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

  async deleteAllStudents() {
    const confirmation = confirm('Sind Sie sicher, dass Sie alle Schüler löschen möchten?');
    if (confirmation) {
      console.log(this._students);
      this.isLoading = true;
      await lastValueFrom(this.restService.deleteAllStudents());
      this.isLoading = false;      
      location.reload();
    }
  }
  compare(a: string | number, b: string | number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  customSort(event: Sort) {
    const data = this.filteredStudents.data.slice();
    if (!event.active || event.direction === '') {
      this.filteredStudents.data = data;
      return;
    }
  
    this.filteredStudents.data = data.sort((a, b) => {
      const isAsc = event.direction === 'asc';
      switch (event.active) {
        case 'firstName': return this.compare(a.student.firstName.toLowerCase(), b.student.firstName.toLowerCase(), isAsc);
        case 'lastName': return this.compare(a.student.lastName.toLowerCase(), b.student.lastName.toLowerCase(), isAsc);
        case 'balance': return this.compare(a.balance, b.balance, isAsc);
        case 'studentClass': return this.compare(a.student.studentClass.toLowerCase(), b.student.studentClass.toLowerCase(), isAsc);
        default: return 0;
      }
    });
  }

  
  async deleteStudentFromList(lastName: string, firstName: string) {
    const index = this._students.findIndex(
      student => student.firstName === firstName && student.lastName === lastName
    );
    if (index !== -1) {
      await lastValueFrom(this.restService.deleteStudent(this._students[index].studentId));
      location.reload();
    }
  }

 

  onFilterChange(event: any) {
    const selectedValues: string[] = event.value;
    this.selectedFilters = selectedValues;
    console.log('Auswahl geändert:', this.selectedFilters);
    this.applyFilters();
  }
  onFilterCheckboxChange(event: any, filter: string) {
    if (event.checked) {
      this.selectedFilters.push(filter);
    } else {
      const index = this.selectedFilters.indexOf(filter);
      if (index > -1) {
        this.selectedFilters.splice(index, 1);
      }
    }
    this.applyFilters();
  }


  applyFilters() {
    if (this.selectedFilters.length === 0) {
      this.filteredStudents.data = this._students;
    } else {
      this.filteredStudents.data = this._students.filter(student => 
        this.selectedFilters.some(filter => student.studentClass.toUpperCase().includes(filter))
        
      );
      console.log("sdf");
      console.log(this.filteredStudents.data);
    }
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
}

@Component({
  selector: 'AddStudentDialog',
  templateUrl: './AddStudentDialog.html',
})
export class AddStudentDialog {
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
      klasse: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(7)]]
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

  clicked() {
    this.dialogRef.close();
  }
}
//endregion
@Component({
  selector: 'ImportDialog',
  templateUrl: './ImportDialog.html',
})
export class ImportDialog {
  _selectedFile: File | null = null;
  _students: Student[] = [];
  amount: number = 0;
  isImporting: boolean = false;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ImportDialog>,
    private restService: RestService
  ) {}

  onFileSelected(event: any) {
    this._selectedFile = event.target.files[0];
  }

  async importStudent() {
    this.isImporting = true;
    const formData = new FormData();

      if (this._selectedFile) {
        formData.append('file', this._selectedFile); // 'file' ist der Schlüsselname, unter dem die Datei gesendet wird
      } else {
        console.error('File is undefined. Skipping file append.');
      }

      try {
        const response = await lastValueFrom(this.restService.uploadStudentsWithFile(formData));
        console.log('Upload erfolgreich:', response);
      } catch (error) {
        console.error('Fehler beim Hochladen:', error);
      }

      this.isImporting = false;
      this.dialogRef.close();

/*

    // Students von der Datenbank holen
    this.isImporting = true;
    this._students = await lastValueFrom(this.restService.getStudents());

    // File auslesen und Students machen
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

            // Ist der Schüler schon vorhanden?
            if (this._students.find(s => s.studentId === student.studentId)) {
              console.log('Student bereits vorhanden');
            } else {
              // Nein => ab in die Datenbank
              console.log(student.firstName);
              await lastValueFrom(this.restService.addStudent(student));              
            }
          } else {
            console.warn(`Invalid line format: ${lines[i]}`);
          }
        }
        this.isImporting = false;
        this.dialogRef.close();
      };
      reader.readAsText(this._selectedFile);  
    }*/
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