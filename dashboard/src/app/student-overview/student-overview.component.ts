import { Component, OnInit , ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Student, StudentBalance } from '../model/student';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { SharedService } from 'src/services/shared.service';
import { WhiteListServiceService } from 'src/services/white-list-service.service';
import { KeycloakService } from 'keycloak-angular';
import { StudentDetailComponent } from '../student-detail/student-detail.component';
import { HttpClient } from '@angular/common/http';

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-student-overview',
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.css']
})
export class StudentOverviewComponent implements OnInit {
  displayedColumns: string[] = ['firstName', 'lastName', 'balance', 'studentClass', 'actions'];
  // displayedColumns: string[] = ['firstName', 'lastName', 'balance', 'studentClass', 'details'];
  filteredStudents: any[] = [];
  _students: Student[] = [];
  _studentsWithBalance: StudentBalance[] = [];
  _selectedFile: File | null = null;
  isLoading: boolean = false; 
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public restService: RestService,
    public dialog: MatDialog,
    private router: Router,
    private sharedService: SharedService,
    private whiteListService: WhiteListServiceService,
    private keyCloakService: KeycloakService
  ) {
    sharedService.accessAuthShared(keyCloakService, whiteListService);
  }

  async ngOnInit() {
    this._students = await lastValueFrom(this.restService.getStudents());
    this.filteredStudents = this._studentsWithBalance;

    this._students.forEach(async student => {
      let studentBalance = await this.getBalanceForStudent(student.studentId);
      this._studentsWithBalance.push({ student: student, balance: studentBalance });
    });

    this.dataSource.data = this._students;

    console.log(this._students);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  async getBalanceForStudent(studentId: string): Promise<number> {
    return await lastValueFrom(this.restService.getStudentBalance(studentId));
  }

  viewDetails(firstName: string, lastName: string) {
    const student = this.filteredStudents.find(entry => entry.student.firstName === firstName && entry.student.lastName === lastName);
    if (student) {
      const dialogRef = this.dialog.open(StudentDetailComponent, {
        width: '400px',
        data: { studentId: student.student.studentId },
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
      this.isLoading = true;
      await lastValueFrom(this.restService.deleteAllStudents());
      this.isLoading = false;
      location.reload();
    }
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

  filterStudents(event: any) {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.filteredStudents = this._studentsWithBalance.filter(student => 
        student.student.firstName.toLowerCase().includes(query) || 
        student.student.lastName.toLowerCase().includes(query) 
      );
    } else {
      this.filteredStudents = this._studentsWithBalance;
    }
  }

  onFilterChange(event: any) {
    console.log('Auswahl geändert:', event.value);
    switch (event.value) {
      case 'lastname':
        this.filteredStudents = this._studentsWithBalance.sort((a, b) => a.student.lastName.localeCompare(b.student.lastName));
        break;
      case 'class':
        this.filteredStudents = this._studentsWithBalance.sort((a, b) => a.student.studentClass.localeCompare(b.student.studentClass));
        break;
      case 'inf':
        this.filteredStudents = this._studentsWithBalance.filter(student => student.student.studentClass.includes('HIF'));
        break;
      case 'medientechnik':
        this.filteredStudents = this._studentsWithBalance.filter(student => student.student.studentClass.includes('HITM'));
        break;
      case 'medizien':
        this.filteredStudents = this._studentsWithBalance.filter(student => student.student.studentClass.includes('HEl'));
        break;
      case 'elektro':
        this.filteredStudents = this._studentsWithBalance.filter(student => student.student.studentClass.includes('FELA'));
        break;
      case 'all':
        this.filteredStudents = this._studentsWithBalance;
        break;
      default:
        this.filteredStudents = this._studentsWithBalance;
        break;
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
    private restService: RestService,
    private http: HttpClient
  ) {}

  onFileSelected(event: any) {
    this._selectedFile = event.target.files[0];
  }

  async importStudent() {

    const formData = new FormData();
    formData.append('file', this._selectedFile as Blob);
    
    try {
      await lastValueFrom(this.restService.uploadStudentsWithFile(formData));      
      alert('Datei erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
      alert('Fehler beim Hochladen der Datei!');
    }
    this.dialogRef.close();
    
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