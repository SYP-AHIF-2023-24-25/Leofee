import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private baseUrl = 'http://localhost:5196'; // Ändern Sie dies entsprechend Ihrer Backend-URL

  constructor(private http: HttpClient) { }

  // Beispiel GET-Anfrage
  getData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/data`);
  }

  // Beispiel POST-Anfrage
  postData(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/data`, data);
  }

  getStudentDataById(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/students/${studentId}`);
  }

  // Methode zum Abrufen des Guthabens eines Studenten anhand seiner ID
  getStudentBalanceById(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/student/${studentId}/balance`);
  }
}
