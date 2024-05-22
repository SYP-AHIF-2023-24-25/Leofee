/*export class Student {
    firstname: string;
    lastname: string;
    schoolClass: string;
    studentBalance:number;
    id: string;
    constructor(firstName: string, lastName: string, className: string, balance:number, id: string) {
        this.firstname = firstName;
        this.lastname = lastName;
        this.id = id;
        this.schoolClass = className;       
        this.studentBalance = balance;
    }
}*/



export interface Student{
    studentId: string;
    firstName: string;
    lastName: string;
    studentClass: string;  
}

export interface StudentBalance{
    balance: number;
    student : Student;
}

