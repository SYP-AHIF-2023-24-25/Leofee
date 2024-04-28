import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../service/student.service';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-gift-card',
  standalone: true,
  imports: [
    CommonModule, 
    QRCodeModule,
    NgbModule
  ],
  templateUrl: './gift-card.component.html',
  styleUrl: './gift-card.component.css'
})
export class GiftCardComponent {
  amountOfMoney: number = 0;
  eingeloggterBenutzer: string = "";
  userId : any = "";
  qrCodeImage: string = "";
  qrCodeData: string = this.userId // Hier gehört dann die Id vom eingeloggten Benutzer rein und der Geldbetrag
  showQRCode: boolean = false;
  user: string = "";


  constructor(private client: HttpClient, private router: Router, private studentService: StudentService) {

  }

  ngOnInit(): void {
    this.loadStudentData();
  }
  
  async loadStudentData() {
    const studentId = 'fe4ae22ae3f97a3ba0cc538ceb45f99469cd10d9686ff61296f97c6ca3f63490'; // Hier müssten Sie die Id des eingeloggten Benutzers abrufen, falls nicht statisch
    
    await this.studentService.getStudentDataById(studentId).subscribe(student => {
      console.log(student)
      this.userId = student.id; 
      this.user = student.lastname;
      this.generateQRCode();
    });

    this.studentService.getStudentBalanceById(studentId).subscribe(balance => {
      this.amountOfMoney = balance;
      this.qrCodeData = `${studentId}-${balance}`; 
    });
  }

  generateQRCode() {
    QRCode.toDataURL(this.qrCodeData)
      .then(url => {
        this.qrCodeImage = url;
        this.showQRCode = true;
      })
      .catch(err => {
        console.error(err);
      });
    }
      
    // Annahme: AuthService enthält eine Methode zum Abrufen des eingeloggten Benutzers und seines Geldbetrags
    //this.geldbetrag = this.authService.getGeldbetrag();
   // this.eingeloggterBenutzer = this.authService.getEingeloggterBenutzer();
}
