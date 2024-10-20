import { Component } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RestService } from 'src/services/rest.service';
import { Student } from '../model/student';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent {
  student: Student|undefined;
  balance: number|undefined;
  usedValue: number|undefined = 0;
  constructor(private route: ActivatedRoute, private router: Router,public restService: RestService) {}

  async ngOnInit() {
    const studentIdString = this.route.snapshot.paramMap.get('id');
    if (studentIdString) {
      this.student = await this.getStudentById(studentIdString);
      this.balance = await this.getStudentBalance(studentIdString);
      this.usedValue = await this.getStudentUsedValue(studentIdString);
    }
  } 
  async getStudentById(id: string): Promise<Student> {
    try {
      return await lastValueFrom(this.restService.getStudentWithID(id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  }
  async getStudentBalance(id: string): Promise<number> {
    try {
      return await lastValueFrom(this.restService.getStudentBalance(id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  }
  async getStudentUsedValue(id: string): Promise<number> {
    try {
      return await lastValueFrom(this.restService.getStudentUsedValue(id));
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  }
  async deleteStudentFromList(){ 
      if(this.student){
        await lastValueFrom(this.restService.deleteStudent(this.student.studentId));
        this.router.navigate(['/studentsOverview']);
      }
    }
}
