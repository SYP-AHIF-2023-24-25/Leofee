import { Router, RouterModule } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { IBuffet } from 'src/model/buffet/buffet';
import { Product } from 'src/model/buffet/product';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, fromEvent, map, Observable, startWith, Subscription, tap } from 'rxjs';
import { QRScannerDialogComponent } from '../qrscanner-dialog-component/qrscanner-dialog-component.component';
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

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
    private router: Router,
    private _snackBar: MatSnackBar,
    public dialog2: MatDialog
  ) {


  }



  resizeObservable$!: Observable<Event>
  resizeSubscription$!: Subscription

  async ngOnInit() {
    await this.dataService.loadBuffetProducts();
    //console.log(this.dataService.buffets);
    this.buffets = this.dataService.buffets;
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
    return products / 100.0;
  }

  AmountDeduct(studentID: String) {
    //Rest Service aufrufen und Bons holen 
    //Gibt es keine Bons oder ist der QR Code nicht gültig, dann Fehlermeldung anzeigen
    //
    
    

  }



 async openDialogQRCodeScanner() {
  alert("QR Code erst am Ende der Bestellung scannen!");
    const dialogRef =  this.dialog.open(QRScannerDialogComponent);
    dialogRef.afterClosed().subscribe(scannedValue => {
      if (scannedValue) {
        console.log('Scanned Value in KassaComponent:', scannedValue);
        //Gutscheine mit der StudentID Holen
        //Betrag von dem Gutschein abziehen
        //Betrag in der Kassa anzeigen
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

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogQuestion, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      //// console.log(`The dialog was closed with answer ${result}`);
      if (result === 'no') {
        return;
      }
      // TODO: Buchung an REST-Service schicken
      //console.log('sending booking to server ...');
      this.dataService.saveBookings(this.selectedBuffet);
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
