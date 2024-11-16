import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from './rest.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  //baseURL wenn local!

  private baseUrl = 'http://localhost:5015'; // Change this according to your backend URL
  private htlLeondingUrl = 'https://vm64.htl-leonding.ac.at/'; 

  constructor(private http: HttpClient, 
    private restService: RestService
  ) { }

  // Example GET-Request
  getData(): Observable<any> {
    return this.http.get<any>(`${this.htlLeondingUrl}/data`);
  }

  // Example POST-Request
  postData(data: any): Observable<any> {
    return this.http.post<any>(`${this.htlLeondingUrl}/data`, data);
  }
  // Method to retrieve student data by ID
  getStudentDataById(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.htlLeondingUrl}/students/${studentId}`);
  }

  // Methode zum Abrufen des Guthabens eines Studenten anhand seiner ID
  public async getBalanceForStudent(id: string): Promise<number> {
    let balance = await this.restService.getStudentBalance(id).toPromise();
    return balance! /100;
}

}