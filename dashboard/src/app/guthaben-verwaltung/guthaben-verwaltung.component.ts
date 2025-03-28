import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RestService } from 'src/services/rest.service';
import { from, last, lastValueFrom } from 'rxjs';
import { Bons, BonWithBalance,BonResponse, Bon } from '../model/Bons';
import { Student } from '../model/student';
import { Transaction } from '../model/Transaction';

import { registerables, Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { SharedService } from 'src/services/shared.service';
import { KeycloakService } from 'keycloak-angular';
import { WhiteListServiceService } from 'src/services/white-list-service.service';

@Component({
  selector: 'app-guthaben-verwaltung',
  templateUrl: './guthaben-verwaltung.component.html',
  styleUrls: ['./guthaben-verwaltung.component.css']
})
export class GuthabenVerwaltungComponent implements OnInit {
  public chart: any;
  _students: Student[] = [];
  _activeBon?: BonWithBalance;
  isBonExpired: boolean = true; 
  _transactions: Transaction[] = [];
  isBonActive: boolean = false;

  fromDate: Date | null = null;
  fromTime: string = '';
  toDate: Date | null = null;
  toTime: string = '';
  today: Date = new Date(); // Aktuelles Datum

  hoehe: number = 0;
  max: number = 0;
  ist: number = 0;

  errorMessage: string = '';

  constructor(
    public restService: RestService,
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    //private keyCloakService: KeycloakService,
  ) {
    //const whiteListService = Inject(WhiteListServiceService)
    //sharedService.accessAuthShared(keyCloakService, whiteListService)

    
  }

  async ngOnInit() {

    let currentBon = await lastValueFrom(this.restService.getCurrentBon());
    if(currentBon != null)
    {
      this._activeBon = currentBon.currentBon;
      
    }
   
    console.log("Current Bon: " + currentBon);
  

    // Fetch students and transactions
    this._students = await lastValueFrom(this.restService.getStudents());
    this._transactions = await lastValueFrom(this.restService.getAllTransactions());
    console.log(this._transactions);

   

    //const bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(this._students[0].studentId));
    //console.log(bonsForStudent)
  
    console.log(this._activeBon)
    
    

    if (this._activeBon) {
      const hoeheBons = this._activeBon!.amountPerStudent ;
      console.log(this._activeBon.startDate)
      let splitedFromTime = this._activeBon.startDate.toString().split('T')[1].split(':');
      let splitedToTime = this._activeBon.endDate.toString().split('T')[1].split(':');
      //console.log(splitedFromTime)
      this.fromDate  = this._activeBon.startDate || "";
      this.fromTime = splitedFromTime[0] + ":" + splitedFromTime[1] || "";
      this.toDate= this._activeBon.endDate || "";
      this.toTime = `${splitedToTime[0]}:${splitedToTime[1]}`  || "";
     // console.log(   this.toTime );
      this.hoehe = hoeheBons || 0;
      this.max = hoeheBons * this._students.length || 0;
      this.ist = this._activeBon.BonsConsumed || 0; 
      this.isBonActive= true;     
    }
    else{
      this.fromDate = null;
      this.fromTime = '';
      this.toDate = null;
      this.toTime = '';
      this.hoehe = 0;
      this.max = 0;
      this.ist = 0;
    }
   

    this.createChart();
  }

  
  updateMax() {
    this.max = this.hoehe * this._students.length;
  }

  updateHoehe() {
    this.hoehe = Math.round(this.max / this._students.length);
  }

   setDefaultDateTime() {
    this.fromDate = new Date();
    this.fromTime = this.getCurrentTime();
    this.toDate = new Date();
    this.toTime = this.getCurrentTime();
  }

  getCurrentTime(): string {
    const now = new Date();
    return this.formatTime(now.getHours(), now.getMinutes());
  }

  formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  validateFromDate() {
    if (this.fromDate && this.fromDate < this.today) {
      this.fromDate = this.today;
    }
    if(this.fromDate != null){
      if (this.toDate && this.toDate < this.fromDate) {
        this.toDate = this.fromDate;
      }
    }
    
    this.validateToTime();
  }

  validateToDate() {
    if (this.toDate && this.fromDate && this.toDate < this.fromDate) {
      this.toDate = this.fromDate;
    }
    this.validateToTime();
  }

  validateFromTime() {
    if (!this.fromDate) return;

    const now = new Date();
    const [selectedHours, selectedMinutes] = this.fromTime.split(':').map(Number);

    if (
      this.fromDate.toDateString() === now.toDateString() &&
      (selectedHours < now.getHours() || (selectedHours === now.getHours() && selectedMinutes < now.getMinutes()))
    ) {
      this.fromTime = this.getCurrentTime();
    }

    this.validateToTime();
  }

  validateToTime() {
    if (!this.toDate || !this.fromDate) return;

    const [fromHours, fromMinutes] = this.fromTime.split(':').map(Number);
    const [toHours, toMinutes] = this.toTime.split(':').map(Number);

    // Falls das ToDate am selben Tag wie FromDate ist, darf ToTime nicht kleiner als FromTime sein
    if (
      this.fromDate.toDateString() === this.toDate.toDateString() &&
      (toHours < fromHours || (toHours === fromHours && toMinutes < fromMinutes))
    ) {
      // Falls ungültig, setzen wir eine gültige ToTime nach FromTime
      /*const newToHours = fromHours;
      const newToMinutes = fromMinutes + 1; // Eine Minute später
      this.toTime = this.formatTime(newToHours, newToMinutes);*/
    }
  }

  

  createChart() {
    Chart.register(...registerables);
    // Aggregate transactions within 2-hour intervals
    const aggregatedData: number[] = [];
    const bonCounts: number[] = [];
    const interval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
    // Sort transactions by time
    const sortedTransactions = this._transactions.sort((a, b) => new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime());
  
    if (sortedTransactions.length === 0) {
      return; // No transactions to display
    }
  
    let currentIntervalStart = new Date(sortedTransactions[0].transactionTime).getTime(); // Start with the first transaction time
    let currentIntervalEnd = currentIntervalStart + interval;
    let currentSum = 0;
    let currentBonCount = 0;
  
    sortedTransactions.forEach(transaction => {
      const transactionTime = new Date(transaction.transactionTime).getTime();
      while (transactionTime >= currentIntervalEnd) {
        aggregatedData.push(currentSum);
        bonCounts.push(currentBonCount);
        currentSum = 0;
        currentBonCount = 0;
        currentIntervalStart = currentIntervalEnd;
        currentIntervalEnd = currentIntervalStart + interval;
      }
      currentSum += transaction.totalTransactionAmount;
      currentBonCount += 1;
    });
  
    // Push the last interval data
    aggregatedData.push(currentSum);
bonCounts.push(currentBonCount);

const canvas = document.getElementById('myChart') as HTMLCanvasElement;
if (canvas) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: aggregatedData.map((_, index) => new Date(currentIntervalStart + index * interval)),
        datasets: [
          {
            label: 'Amount spent',
            data: aggregatedData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Number of Bons',
            data: bonCounts,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    console.error('Failed to get 2D context');
  }
} else {
  console.error('Canvas element not found');
}
  }

  dateRangeValidator(group: AbstractControl): { [key: string]: boolean } | null {

    const fromDateControl = group.get('from');
    const fromTimeControl = group.get('fromTime');
    const toDateControl = group.get('to');
    const toTimeControl = group.get('toTime');
  
    if (!fromDateControl || !fromTimeControl || !toDateControl || !toTimeControl) {
      return null;
    }
  
    const fromDate = new Date(fromDateControl.value);
    let fromTime = fromTimeControl.value;
    if (!fromTime) {
      fromTime = "00:00";
    } else {
      fromTime = fromTime.split(':');
    }
    fromDate.setHours(fromTime[0], fromTime[1]);
  
    const toDate = new Date(toDateControl.value);
    let toTime = toTimeControl.value;
    if (!toTime) {
      toTime = "00:00";
    } else {
      toTime = toTime.split(':');
    }
    toDate.setHours(toTime[0], toTime[1]);
  
    return fromDate && toDate && fromDate > toDate ? { dateRangeInvalid: true } : null;
  
  }


  

  async deleteBon(){
    if (this._activeBon) {
      this.restService.deleteBon(this._activeBon.id).subscribe(() => {
        alert(`Bon wurde gelöscht`);
       
        this._activeBon = undefined; // Set to null after deletion
        this.isBonActive= false;
        this.fromDate = null;
        this.fromTime = '';
        this.toDate = null;
        this.toTime = '';
        this.hoehe = 0;
        this.max = 0;
        this.ist = 0;
      });
    } else {
      alert('Kein aktiver Bon vorhanden');
    }
  }
  validateFields(): boolean {
    this.errorMessage = '';

    if (!this.fromDate || !this.toDate) {
      this.errorMessage = 'Bitte wählen Sie ein gültiges Start- und Enddatum aus.';
      return false;
    }

    if (this.toDate < this.fromDate) {
      this.errorMessage = 'Das Enddatum darf nicht vor dem Startdatum liegen.';
      return false;
    }

    if(this.hoehe <= 0){
      alert("Betrag muss größer als 0 sein");
      return false;
    }

    return true;
  }
 
  async addBon(){

    console.log("Add Bon");
    console.log(this.fromDate);
    console.log(this.fromTime);
    console.log(this.toDate);
    console.log(this.toTime);
    console.log(this.hoehe);
    console.log(this.max);
    console.log(this.ist);
   //"2025-03-30T15:55:23.850Z",

     // Kombinieren von fromDate und fromTime
  const fromDateTime = new Date(this.fromDate!);
  const [fromHours, fromMinutes] = this.fromTime.split(':').map(Number);
  fromDateTime.setHours(fromHours, fromMinutes, 0, 0);

  // Kombinieren von toDate und toTime
  const toDateTime = new Date(this.toDate!);
  const [toHours, toMinutes] = this.toTime.split(':').map(Number);
  toDateTime.setHours(toHours, toMinutes, 0, 0);
  this.isBonActive=true;
  console.log("From DateTime:", fromDateTime);
  console.log("To DateTime:", toDateTime);
    await lastValueFrom(this.restService.addBon(fromDateTime, toDateTime, this.hoehe)).then((response) => {
      alert(`Bon wurde erstellt`);
      this._activeBon = response;
      console.log(this._activeBon);
      
    });
   
  }

  async updateBon(){
    if (this.hoehe < this._activeBon!.amountPerStudent) {
      alert('Die neue Bon-Höhe muss größer als die ursprüngliche Höhe sein.');
      return;
    }

    const fromDateTime = new Date(this.fromDate!);
    const [fromHours, fromMinutes] = this.fromTime.split(':').map(Number);
    fromDateTime.setHours(fromHours, fromMinutes, 0, 0);

    // Kombinieren von toDate und toTime
    const toDateTime = new Date(this.toDate!);
    const [toHours, toMinutes] = this.toTime.split(':').map(Number);
    toDateTime.setHours(toHours, toMinutes, 0, 0);

    await lastValueFrom(this.restService.updateBonForStudent(this._activeBon!.id, fromDateTime, toDateTime, this.hoehe, this.ist));

    alert("Bon wurde aktualisiert");

  } 
}