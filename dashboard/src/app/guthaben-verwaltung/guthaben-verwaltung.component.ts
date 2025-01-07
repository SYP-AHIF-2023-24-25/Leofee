import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { Bons, BonWithBalance,BonResponse } from '../model/Bons';
import { Student } from '../model/student';
import { Transaction } from '../model/Transaction';

import { registerables, Chart } from 'chart.js';
//import 'chartjs-adapter-date-fns';
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
  voucherForm: FormGroup;
  _transactions: Transaction[] = [];

  constructor(
    public restService: RestService,
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private keyCloakService: KeycloakService,
  ) {
    const whiteListService = Inject(WhiteListServiceService)
    sharedService.accessAuthShared(keyCloakService, whiteListService)

    this.voucherForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      hoehe: [0, [Validators.required, Validators.min(0.01)]],
      max: [0, [Validators.required, Validators.min(0.01)]],
      ist: [0]
    }, { validators: this.dateRangeValidator });
  }

  async ngOnInit() {
    let currentBon = await lastValueFrom(this.restService.getCurrentBon());
    this._activeBon = currentBon.currentBon;

    // Fetch students and transactions
    this._students = await lastValueFrom(this.restService.getStudents());
    this._transactions = await lastValueFrom(this.restService.getAllTransactions());
    console.log(this._transactions);

    // Calculate total balance for all students
    /*let balanceAllStudents = 0;
    for (const student of this._students) {
      console.log(student.studentId);
      const value = await lastValueFrom(this.restService.getStudentUsedValue(student.studentId));

      balanceAllStudents += value;
    }*/

    const bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(this._students[0].studentId));
    console.log(bonsForStudent)
   // this._activeBon = bonsForStudent;
    console.log(this._activeBon)

    const hoeheBons = this._activeBon.amountPerStudent ;

    if (this._activeBon) {
      this.voucherForm.patchValue({
        from: this._activeBon.startDate || "",
        to: this._activeBon.endDate || "",
        hoehe: hoeheBons || 0,
        max: hoeheBons * this._students.length || 0,
        ist: currentBon.amount || 0
      });

      this.checkBonExpiry();
    }
     // Überwache Änderungen des "from"-Wertes
    this.voucherForm.get('from')?.valueChanges.subscribe(() => {
      this.checkBonExpiry();
      this.voucherForm.updateValueAndValidity(); // Datum-Validierung erneut prüfen
    });

    this.createChart();
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
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    return from && to && new Date(from) > new Date(to) ? { dateRangeInvalid: true } : null;
  }


  get maxValue(): number {
    const hoehe = this.voucherForm.get('hoehe')?.value;
    return hoehe && this._students.length > 0 ? hoehe * this._students.length : 0;
  }

  get hoeheValue(): number {
    const max = this.voucherForm.get('max')?.value;
    return max && this._students.length > 0 ? max / this._students.length : 0;
  }

  async onSubmit() {
    if (this.voucherForm.valid) {

        const currentBon = await lastValueFrom(this.restService.getBonsForStudent(this._students[0].studentId));
        if (currentBon != null) {
          const existingBon = currentBon;
          await lastValueFrom(this.restService.updateBonForStudent(
            1,
            this.voucherForm.value.from,
            this.voucherForm.value.to,
            this.voucherForm.value.hoehe,
            0
          ));
          alert(`Bon wurde geupdatet`);   
        // console.log(`Bon für Student ${student.studentId} wurde aktualisiert.`);
        } else {
          await lastValueFrom(this.restService.addBon(          
            this.voucherForm.value.from,
            this.voucherForm.value.to,
            this.voucherForm.value.hoehe
          ));  
          alert(`Bon in der höhe von ${this.voucherForm.value.hoehe}€ wurden erfolgreich erstellt`);        
        }
           
    } else {
      console.log('Form invalid');
    }
  }

  checkBonExpiry() {
    const fromDate = new Date(this.voucherForm.get('from')?.value);
    const today = new Date();

    if (fromDate <= today) {
      this.isBonExpired = true;
      this.voucherForm.get('hoehe')?.disable();
      this.voucherForm.get('max')?.disable();
      this.voucherForm.get('ist')?.disable();
    } else {
      this.isBonExpired = false;
      this.voucherForm.get('hoehe')?.enable();
      this.voucherForm.get('max')?.enable();
      this.voucherForm.get('ist')?.enable();
    }
  }
}