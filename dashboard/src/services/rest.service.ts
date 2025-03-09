import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Student, StudentWithBalance } from '../app/model/student';
import { Bons, Bon, BonWithBalance, BonResponse } from 'src/app/model/Bons';
import { Transaction } from 'src/app/model/Transaction';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  baseURL = '';
  constructor(
    private http: HttpClient) {

    this.baseURL = environment.httpUrlLeofeeBackend;
  }

  getStudents(): Observable<Student[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<Student[]>(
      this.baseURL + "api/Students",
      { headers });
  }

  getStudentsWithBalance(): Observable<StudentWithBalance[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<StudentWithBalance[]>(
      this.baseURL + "api/Students/allStudentsWithBalances",
      { headers });
  }


  deleteStudent(id: String): Observable<void> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.delete<any>(
      this.baseURL + "api/Students/" + id,
      { headers });
  }

  getStudentBalance(id: String): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<any>(
      this.baseURL + "api/Students/" + "balance/" + id,
      { headers });
  }

  uploadStudentsWithFile(formData: FormData): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.post<any>(
      this.baseURL + "api/Students/UploadStudents", formData,
      { headers });

  }

  deleteAllStudents(): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.delete<any>(
      this.baseURL + "api/Students/DeleteAll",
      { headers });
  }


  getBonsForStudent(id: String): Observable<Bons> {
    let headers: HttpHeaders = new HttpHeaders();

    return this.http.get<Bons>(
      this.baseURL + "api/Students/" + id + "/bons",
      { headers });

  }

  getStudentUsedValue(id: String): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<number>(
      this.baseURL + "api/Students/" + id + "/usedValue",
      { headers });
  }

  getCurrentBon(): Observable<BonResponse | null> {
    let headers: HttpHeaders = new HttpHeaders();
    let bon:  Observable<BonResponse | null>;
    console.log("getCurrentBon");
    bon = this.http.get<BonResponse>(
      this.baseURL + "currentBonWithBalance",
      { headers }
    ).pipe(
      catchError(error => {
        console.error("Error in getCurrentBon", error);
        return of(null); // Gibt ein Observable mit null zurück
      })
    );
    console.log("Fertig");
    console.log(bon);
    return bon
  }


  addStudent(student: Student): Observable<any> {
    const url = this.baseURL + `api/Students`;
    const headers: HttpHeaders = new HttpHeaders();
    return this.http.post<any>(url, student, { headers });
  }

  addBon(from: Date, to: Date, amount: number): Observable<any> {

    const url = this.baseURL + `api/Bons`;
    const headers: HttpHeaders = new HttpHeaders();
    const payload = {
      amountPerStudent: amount,
      startDate: from,
      endDate: to,
    };

    console.log(payload)
    return this.http.post<any>(url, payload, { headers });
  }

  updateBonForStudent(id: number, from: Date, to: Date, amount: number, usedValue: number): Observable<any> {
    const url = this.baseURL + `api/Bons/${id}`;
    // console.log(id, from.toISOString(), to, amount, usedValue, url);
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid date format');
    }


    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const payload = {
      amountPerStudent: amount,
      startDate: fromDate.toISOString(),
      endDate: toDate.toISOString(),
      id: id
    };
    console.log(payload, url);
    return this.http.put<any>(url, payload, { headers });
  }


  getAllTransactions(): Observable<Transaction[]> {
    let headers: HttpHeaders = new HttpHeaders();

    return this.http.get<Transaction[]>(
      this.baseURL + "api/Transactions",
      { headers });

  }
  getStudentWithID(id: String): Observable<Student> {
    const url = `${this.baseURL}api/Students/id/${id}`;
    const headers: HttpHeaders = new HttpHeaders({
      'accept': 'text/plain'
    });

    return this.http.get<Student>(url, { headers });
  }


}
