import { RestService } from './rest.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student } from '../app/model/student';
import { Bons } from 'src/app/model/Bons';







@Injectable({
providedIn: 'root'
})
export class DataService {

   

    constructor(   
        private restService: RestService
       ) {
    
      }

    public async getAllStudents(): Promise<Student[]> {
        let students = await this.restService.getStudents().toPromise();
        return students!;
    }
    public async getBalanceForStudent(id: string): Promise<number> {
        let balance = await this.restService.getStudentBalance(id).toPromise();
        return balance! /100;
    }

    public async getBonsForStudent(id: string): Promise<Bons[]> {       
        
        let bons = await this.restService.getBonsForStudent(id).toPromise();
        return bons!;
    }

    public async deleteStudent(id: string): Promise<any> {
        let response = await this.restService.deleteStudent(id).toPromise();
        return response!;
    }


    public async addStudent(student: Student): Promise<any> {
        let response = await this.restService.addStudent(student).toPromise();
        return response!;
    }

    public async addBonForStudent(id: string, from: Date, to: Date, amount: number): Promise<any> {
        console.log(id);
        let response = await this.restService.addBonForStudent(id,from, to, amount).toPromise();
        return response!;
    }     
}  