import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../model/student';
import { environment } from '../enviorment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
 
  private baseUrl = '';
  constructor(private http: HttpClient) { 
    this.baseUrl = environment.httpUrlLeofeeBackend;
  }

  // Method to retrieve student data by ID
  getStudentDataById(studentId: string): Observable<Student> {
    return this.http.get<any>(`${this.baseUrl}/api/Students/id/${studentId}`);
  }

  // Methode zum Abrufen des Guthabens eines Studenten anhand seiner ID
  getStudentBalance(studentId: string): Observable<number>{
    let url: string = `${this.baseUrl}/api/Students/balance/${studentId}`;
    return this.http.get<number>(url);
  }

  getStudentUsedvalue(studentId: string): Observable<number> {
    let url: string = `${this.baseUrl}/api/Students/${studentId}/usedValue`;
    return this.http.get<number>(url);
  }

}