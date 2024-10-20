import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../app/model/student';
import { Bons } from 'src/app/model/Bons';
import { environment } from 'src/environments/environment.prod';
import { Transaction } from 'src/app/model/Transaction';


@Injectable({
  providedIn: 'root'
})
export class RestService {

    baseURL = '';
    constructor(
        private http: HttpClient) {

          this.baseURL =  environment.httpUrlLeofeeBackend;
    }

    getStudents(): Observable<Student[]> {
        let headers: HttpHeaders = new HttpHeaders();
        return this.http.get<Student[]>(
          this.baseURL + "api/Student",
            {headers});
    }

    
    deleteStudent(id: String): Observable<void> {
        let headers: HttpHeaders = new HttpHeaders();
        return this.http.delete<any>(
          this.baseURL +"api/Student/" + id,
            {headers});
    }

    getStudentBalance(id: String): Observable<number> {
        let headers: HttpHeaders = new HttpHeaders();       
        return this.http.get<any>(
          this.baseURL+ "api/Student/"+ id+"/balance",
            {headers});
    }


    getBonsForStudent(id: String): Observable<Bons[]>  {
      let headers: HttpHeaders = new HttpHeaders();
    
      return this.http.get<Bons[]>(
        this.baseURL+ "api/Student/"+ id + "/bons" ,
          {headers});

    }

    getStudentUsedValue(id: String): Observable<number> {
      let headers: HttpHeaders = new HttpHeaders();       
      return this.http.get<number>(
        this.baseURL+ "api/Student/"+ id+"/usedValue",
          {headers});
    }

    addStudent(student: Student): Observable<any> {
      const url =  this.baseURL + `api/Student`;
      const headers: HttpHeaders = new HttpHeaders();
      return this.http.post<any>(url, student, { headers });
    }

    addBonForStudent(id: String,from: Date, to:Date,  amount: number): Observable<any> {

      const url =  this.baseURL+ `api/Bon`;
      const headers: HttpHeaders = new HttpHeaders();
      const payload = {
        studentId: id,
        from: from,
        to: to,
        value: amount
      };

      console.log(payload)
      return this.http.post<any>(url, payload, { headers });

    }

    updateBonForStudent(id: number,from: Date, to:Date,  amount: number, usedValue: number): Observable<any> {
      const url =  this.baseURL+ `api/Bon/${id}`;
      const headers: HttpHeaders = new HttpHeaders();
      const payload = {
        studentId: "",
        from: from,
        to: to,
        value: amount,
        usedValue: usedValue,
        id: id
      };
      return this.http.put<any>(url, payload, { headers });
    }
    getAllTransactions(): Observable<Transaction[]>  {
      let headers: HttpHeaders = new HttpHeaders();
    
      return this.http.get<Transaction[]>(
        this.baseURL+ "api/Transaction" ,
          {headers});

    }
    getStudentWithID(id: String): Observable<Student> {
      const url = `${this.baseURL}api/Student/${id}?studentId=${id}`;
      const headers: HttpHeaders = new HttpHeaders({
        'accept': 'text/plain'
      });

      return this.http.get<Student>(url, { headers });
    }
    

}