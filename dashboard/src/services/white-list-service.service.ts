import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WhiteListUser } from 'src/app/model/white-list-user';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WhiteListServiceService {
  baseURL = 'api/WhiteListUser';
  constructor(private http: HttpClient) { 
    this.baseURL = environment.httpUrlLeofeeBackend + 'api/WhiteListUser';
  }
  
  
  getAllWhiteListUsers(): Observable<WhiteListUser[]> {
    let headers: HttpHeaders = new HttpHeaders();
    return this.http.get<WhiteListUser[]>(
      this.baseURL, 
      {headers});
  }

  getWhiteListUserById(userId: string): Observable<WhiteListUser> {
    let headers: HttpHeaders = new HttpHeaders();
    let newUrl = this.baseURL + '/' + userId;
    return this.http.get<WhiteListUser>(
      newUrl, 
      {headers});
  }

  deleteWhiteListUser(userId: string): Observable<WhiteListUser> {
    let headers: HttpHeaders = new HttpHeaders();
    let newUrl = this.baseURL + '/' + userId;
    let deltedUser: Observable<WhiteListUser> = this.http.delete<WhiteListUser>(
      newUrl, 
      {headers});
    
    return deltedUser;
  }

  addWhiteListUser(user: WhiteListUser): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    let addedUser: Observable<any> = this.http.post<any>(
      this.baseURL, 
      user, 
      {headers});
    return addedUser;
  }

  checkIfUserIsWhiteListed(userId: any): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    let newUrl = this.baseURL + '/' + userId;
    let isWhiteListed: Observable<boolean> = this.http.get<boolean>(
      newUrl, 
      {headers});
    return isWhiteListed;
  }
}