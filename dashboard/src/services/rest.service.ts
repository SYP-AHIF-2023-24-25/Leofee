import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../app/model/student';
import { Bons } from 'src/app/model/Bons';



@Injectable({
  providedIn: 'root'
})
export class RestService {

    constructor(
        private http: HttpClient) {
    }

    getStudents(): Observable<Student[]> {
        let headers: HttpHeaders = new HttpHeaders();
        return this.http.get<Student[]>(
          "http://localhost:5015/api/Student",
            {headers});
    }

    deleteStudent(id: String): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders();
        return this.http.delete<any>(
          "http://localhost:5015/api/Student/student/" + id,
            {headers});
    }

    getStudentBalance(id: String): Observable<number> {
        let headers: HttpHeaders = new HttpHeaders();
       // console.log("http://localhost:5196/student/"+ id + '/balance');
        return this.http.get<any>(
          "http://localhost:5015/api/Student/student/"+ id+"/balance",
            {headers});
    }


    getBonsForStudent(id: String): Observable<Bons[]>  {
      let headers: HttpHeaders = new HttpHeaders();
      console.log("http://localhost:5015/api/Student/student/"+ id + "/bons" );
      return this.http.get<Bons[]>(
        "http://localhost:5015/api/Student/student/"+ id + "/bons" ,
          {headers});

    }

    addStudent(student: Student): Observable<any> {
      const url = `http://localhost:5015/api/Student`;
      const headers: HttpHeaders = new HttpHeaders();
      return this.http.post<any>(url, student, { headers });
    }

    addBonForStudent(id: String,from: Date, to:Date,  amount: number): Observable<any> {

      console.log(id, amount);

      const url = `http://localhost:5015/api/Bon`;
      const headers: HttpHeaders = new HttpHeaders();
      const payload = {
        studentId: id,
        from: from,
        to: to,
        value: amount
      };

      console.log(url);

      return this.http.post<any>(url, payload, { headers });

    }

}