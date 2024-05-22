import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class RestService {

    constructor(
        private http: HttpClient) {
    }

    getStudentBalance(id: String): Observable<number> {
        let headers: HttpHeaders = new HttpHeaders();       
        return this.http.get<any>(
          "http://localhost:5015/api/Student/student/"+ id+"/balance",
            {headers});
    }
}