export class Student {
    firstName: string;
    lastName: string;
    className: string;
    studentBalance:number;
    constructor(firstName: string, lastName: string, className: string, balance:number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.className = className;       
        this.studentBalance = balance;
    }
}

