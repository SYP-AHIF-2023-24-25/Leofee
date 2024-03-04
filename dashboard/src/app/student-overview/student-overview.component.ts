import { Component } from '@angular/core';
import { Student } from '../model/student';

@Component({
  selector: 'app-student-overview',
  templateUrl: './student-overview.component.html',
  styleUrls: ['./student-overview.component.css']
})
export class StudentOverviewComponent {
  _students: Student[] = [];

    importStudents(event: any) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        const reader = new FileReader();

        // Add missing import for FileReader
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const fileContent = reader.result as string;
          let lines = fileContent.split('\n');          
        for(let i = 1; i < lines.length;i++){
          //Moritz;Passenbrunner;1CHIF
          let parts:string[] = lines[i].split(';');
          this._students.push(new Student(parts[0],parts[1],parts[2]));
        } 
        console.log('Zeilen:', this._students);
      };

      // Handle error when reading the file
      reader.onerror = (e:ProgressEvent<FileReader>) => {
        console.error('Fehler beim Lesen der Datei:', e);
      };

      // Lese den Dateiinhalt als Text
      reader.readAsText(selectedFile);

    
    }
  }
  test(){
    console.log('test');
  }
  deleteStudentFromList(lastName:string, firstName:string){
    const index = this._students.findIndex(
      student => student.firstName === firstName && student.lastName === lastName
    );
    if (index !== -1) {
      // Wenn der Student gefunden wurde, entferne ihn aus dem Array
      this._students.splice(index, 1);
      //location.reload();
    }
  

  }
  onFilterChange(event: any) {
    // Diese Methode wird aufgerufen, wenn sich die Auswahl im Dropdown ändert
    console.log('Auswahl geändert:', event.value);
    if(event.value === 'lastname'){
      this._students.sort((a, b) => a.lastName.localeCompare(b.lastName));
    }
    else if(event.value === 'class'){
      this._students.sort((a, b) => a.className.localeCompare(b.className));
    }
    
  }





  exportToCSV(): void {
    if (this._students.length === 0) {
      console.log('Keine Daten zum Exportieren vorhanden.');
      return;
    }
    const csvHeader = 'Firstname;Lastname;Class\n';
    const csvRows = this._students.map(student => `${student.firstName};${student.lastName};${student.className}`).join('\n');
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
                  <td>${student.className}</td>
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
