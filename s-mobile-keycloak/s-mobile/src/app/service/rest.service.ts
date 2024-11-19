import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RestService {
    urlString: String = "https://vm64.htl-leonding.ac.at/";
    // bei localer ausführung auf http://localhost:5015 anpassen
    constructor(
        private http: HttpClient) {
    }

    getStudentBalance(id: String): Observable<number> {
        let headers: HttpHeaders = new HttpHeaders();       
        return this.http.get<any>(       
          this.urlString + "/api/Student/" + id + "/balance",
            {headers});
            // http://localhost:5015/api/Student/if200143/balance
    }
}