import { Router, RouterModule } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { IBuffet } from 'src/model/buffet/buffet';
import { Product } from 'src/model/buffet/product';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, fromEvent, map, Observable, startWith, Subscription, tap } from 'rxjs';
import { QRScannerDialogComponent } from '../qrscanner-dialog-component/qrscanner-dialog-component.component';
import { BonBooking } from 'src/model/buffet/bonBooking';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { Student } from 'src/model/Student';



@Component({
  selector: 'app-kassa',
  templateUrl: './kassa.component.html',
  styleUrls: ['./kassa.component.scss']
})
export class KassaComponent implements OnInit {

  buffets: IBuffet[] = [];

  selectedBuffet: IBuffet = this.buffets[0];
  total = 0.0;
  numberColumns = 4;
  AmountOfBon: number = 0.0; 
  bonUsed: boolean = false; 
  studentID: string = '';


  constructor(
    public dialog: MatDialog,   
    private router: Router,
    private _snackBar: MatSnackBar,
    public dialog2: MatDialog,
    private restService: RestService
  ) {


  }



  resizeObservable$!: Observable<Event>
  resizeSubscription$!: Subscription

  async ngOnInit() {

    await lastValueFrom(this.restService.getProducts());
    //console.log(this.dataService.buffets);
    this.buffets = await lastValueFrom(this.restService.getBuffets());
    this.selectedBuffet = this.buffets[0];
    this.numberColumns = window.innerWidth / 250;
    this.resizeObservable$ = fromEvent(window, 'resize')
    this.resizeSubscription$ = this.resizeObservable$.subscribe(evt => {
      this.numberColumns = window.innerWidth / 250;
    })
  }

  inc(p: Product) {
    if (p.price < 0 && p.amount === 2) {
      const ref = this._snackBar.open("Nur max. 2 Markerl einlösbar pro Person!", "OK", {
        duration: 5000,
      });
    }
    else {
      p.amount++;
    }
  }

  dec(p: Product) {
    if (p.amount > 0)
      p.amount--;
  }



  getTotals() {
    if (!this.selectedBuffet) return 0;
    if (this.selectedBuffet.products.length === 0) {
      return 0.0;
    }
    let products = this.selectedBuffet.products
      .map(p => p.amount * p.price)
      .reduce((total, current) => total += current);

 
    //console.log("Products: " + (products/100.0) + " Bon: " + this.AmountOfBon + " Total:)");
    console.log(this.AmountOfBon);
    var result = ((products / 100.0) - this.AmountOfBon);
     
    return result;
  }
 

  async AmountDeduct(studentID: string) {     
    

    let student: Student;
    try {
      console.log(studentID);
      student = await lastValueFrom(this.restService.getStudentById(studentID));
    } catch (error) {
      
        this.openDialogBonRespond("Kein gültiger QR Code!");
        return;
    } 

    let balance = await lastValueFrom(this.restService.getStudentBalance(studentID));
    
    if (balance === 0) {
      this.openDialogBonRespond("Kein Guthaben vorhanden");
      return;
    }


    console.log("Aktuelles Guthaben: ", balance);

    // Gesamtkosten der Bestellung
    const totalCost = this.getTotals();

    // Berechnung des verwendeten Gutscheinbetrags
    let usedBonAmount = 0;
    if (balance >= totalCost) {
      usedBonAmount = totalCost;
      balance -= totalCost;
    } else {
      usedBonAmount = balance;
      balance = 0;
    }

    this.AmountOfBon = usedBonAmount;

    console.log("Verwendeter Gutscheinbetrag: ", this.AmountOfBon);
    console.log("Verbleibendes Guthaben nach Zahlung: ", balance);

    await this.restService.Pay(studentID, this.AmountOfBon).subscribe();
    this.openDialogBonRespond(`Gutschein wurde erfolgreich eingelöst! Wert: ${this.AmountOfBon}€`);
   
  }

  //Bon Amount speichern 


 async openDialogQRCodeScanner() { 

  alert("QR Code erst am Ende der Bestellung scannen!");
    const dialogRef =  this.dialog.open(QRScannerDialogComponent);
    dialogRef.afterClosed().subscribe(scannedValue => {
      if (scannedValue) {
        //console.log('Scanned Value in KassaComponent:', scannedValue);        
        this.bonUsed = true; 
        this.studentID = scannedValue; 
        this.AmountDeduct(scannedValue);

       
       
      } else {
        console.log('Dialog wurde geschlossen, kein gescannter Wert verfügbar.');
      }
    });
    
  }

  hasSelectedProducts() {
    return this.selectedBuffet.products.find(p => p.amount > 0) !== undefined;
  }

  checkout() {
    if (this.getTotals() < 0) {
      let ref = this._snackBar.open("Keine negativen Beträge erlaubt!", "OK", {
        duration: 5000,
      });
      return;
    }
    this.openDialog();
  }



  exit() {
    this.router.navigate(['home']);
  }

  openDialogBonRespond(Messeage: string): void{
    console.log("Bon Respond anzeigen");
    const dialogRef = this.dialog.open(DialogRespond, {
      width: '400px',
      data: { message: Messeage }
    });

    dialogRef.afterClosed().subscribe(result => { 
     
    });


  }

   openDialog(): void {
    const dialogRef = this.dialog.open(DialogQuestion, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
     
      if (result === 'no') {
        return;
      }
     
      if(this.bonUsed){
        let bon: BonBooking = new BonBooking(this.studentID, this.AmountOfBon )
      
        this.restService.saveBookings(this.selectedBuffet, bon );
      }
      else{
        this.restService.saveBookings(this.selectedBuffet, new BonBooking('', 0.0));
      }

      this.AmountOfBon = 0.0;
     
      this.clear();
    });
  }

  clear() {
    this.selectedBuffet.products.forEach(p => p.amount = 0);
  }

}
export interface DialogData {
  answer: string;
}

@Component({
  selector: 'dialog-question',
  templateUrl: 'dialog-question.html',
})

export class DialogQuestion {

  constructor(
    public dialogRef: MatDialogRef<DialogQuestion>) { }

  clicked(answer: string) {
    this.dialogRef.close(answer);
  }
}


@Component({
  selector: 'dialog-BonRespond',
  templateUrl: 'dialog-BonRespond.html',
})

export class DialogRespond{  
  
  message: string;

  constructor(
    public dialogRef: MatDialogRef<DialogRespond>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string } 
  ) {
    this.message = data.message;
  }

  clicked(){
    this.dialogRef.close();
  }
  
}
