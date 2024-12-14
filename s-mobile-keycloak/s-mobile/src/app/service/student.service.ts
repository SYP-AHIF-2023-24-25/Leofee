import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../model/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  //baseURL wenn local!

  private baseUrl = 'http://localhost:5015'; // Change this according to your backend URL
  private htlLeondingUrl = 'https://vm64.htl-leonding.ac.at/'; 

  constructor(private http: HttpClient) { }

  // Method to retrieve student data by ID
  getStudentDataById(studentId: string): Observable<Student> {
    return this.http.get<any>(`${this.baseUrl}/api/Students/id/${studentId}`);
  }

  // Methode zum Abrufen des Guthabens eines Studenten anhand seiner ID
  /*public async getBalanceForStudent(id: string): Promise<number> {
    let balance = await this.restService.getStudentBalance(id);
    return balance! /100;
}*/
  getStudentBalance(studentId: string): Observable<number>{
    let url: string = `${this.baseUrl}/api/Students/balance/${studentId}`;
    return this.http.get<number>(url);
  }


}