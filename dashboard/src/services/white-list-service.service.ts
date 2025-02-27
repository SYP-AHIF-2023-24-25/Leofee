import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { last, lastValueFrom, Observable } from 'rxjs';
import { WhiteListUser } from 'src/app/model/white-list-user';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WhiteListServiceService {
  baseURL = 'api/WhiteListUser';
  constructor(private http: HttpClient) { 
    this.baseURL = environment.httpUrlLeofeeBackend + 'api/WhiteListUser';
    console.log(environment.httpUrlLeofeeBackend);
    console.log(this.baseURL);
    console.log(environment.production);
  }
  
  getAllWhiteListUsers(): Observable<WhiteListUser[]> {
    let headers: HttpHeaders = new HttpHeaders();
    console.log("url: " +this.baseURL)
    return this.http.get<WhiteListUser[]>(
      this.baseURL, 
      {headers});
  }

  getWhiteListUserById(userId: string): Observable<WhiteListUser> {
    console.log("url: " +this.baseURL)

    let headers: HttpHeaders = new HttpHeaders();
    let newUrl = this.baseURL + '/' + userId;
    return this.http.get<WhiteListUser>(
      newUrl, 
      {headers});
  }

  deleteWhiteListUser(userId: string): Observable<WhiteListUser> {
    console.log("url: " +this.baseURL)

    let headers: HttpHeaders = new HttpHeaders();
    let newUrl = this.baseURL + '/' + userId;
    let deltedUser: Observable<WhiteListUser> = this.http.delete<WhiteListUser>(
      newUrl, 
      {headers});
    
    return deltedUser;
  }

  addWhiteListUser(user: WhiteListUser): Observable<any> {
    console.log("url: " +this.baseURL)

    let headers: HttpHeaders = new HttpHeaders();
    let addedUser: Observable<any> = this.http.post<any>(
      this.baseURL, 
      user, 
      {headers});
    return addedUser;
  }

  public checkIfUserIsWhiteListed(userId: any): Promise<boolean> {
    console.log('checkIfUserIsWhiteListed()');
    let returnValue: boolean = false;
    let headers: HttpHeaders = new HttpHeaders();
    let newUrl = this.baseURL + '/exists/' + userId;
    console.log(newUrl);
    let isWhiteListed: Observable<boolean> = this.http.get<boolean>(
      newUrl, 
      {headers});
    lastValueFrom(isWhiteListed).then((value) => {
      returnValue = value;
      console.log('returnValue: ' + returnValue);
    })
    
    return lastValueFrom(isWhiteListed);
  }

  public checkIfUserIsValid(newUser: WhiteListUser): boolean {

    if (!(newUser.userId === '' && newUser.firstName === '' && newUser.lastName === '')) {
      console.log("User is valid");
      return true;
    }
    console.log("User is not valid");
    return false;
  }
}
