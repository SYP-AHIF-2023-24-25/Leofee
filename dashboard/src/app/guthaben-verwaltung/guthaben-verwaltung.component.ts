import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RestService } from 'src/services/rest.service';
import { lastValueFrom } from 'rxjs';
import { Bons } from '../model/Bons';
import { Student } from '../model/student';
import { Transaction } from '../model/Transaction';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-guthaben-verwaltung',
  templateUrl: './guthaben-verwaltung.component.html',
  styleUrls: ['./guthaben-verwaltung.component.css']
})
export class GuthabenVerwaltungComponent implements OnInit {
  public chart: any;
  _students: Student[] = [];
  _activeBon?: Bons;
  isBonExpired: boolean = true;
  voucherForm: FormGroup;
  _transactions: Transaction[] = [];

  constructor(
    public restService: RestService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.voucherForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      hoehe: [0, [Validators.required, Validators.min(0.01)]],
      max: [0, [Validators.required, Validators.min(0.01)]],
      ist: [0]
    }, { validators: this.dateRangeValidator });
  }

  async ngOnInit() {
    // Fetch students and transactions
    this._students = await lastValueFrom(this.restService.getStudents());
    this._transactions = await lastValueFrom(this.restService.getAllTransactions());
    console.log(this._transactions);

    // Calculate total balance for all students
    let balanceAllStudents = 0;
    for (const student of this._students) {
      const value = await lastValueFrom(this.restService.getStudentUsedValue(student.studentId));
      balanceAllStudents += value;
    }

    const bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(this._students[0].studentId));
    this._activeBon = bonsForStudent[0];

    const hoeheBons = this._activeBon.value + this._activeBon.usedValue;

    if (this._activeBon) {
      this.voucherForm.patchValue({
        from: this._activeBon.from || "",
        to: this._activeBon.to || "",
        hoehe: hoeheBons || 0,
        max: hoeheBons * this._students.length || 0,
        ist: balanceAllStudents || 0
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
    // Aggregate transactions within 2-hour intervals
    const aggregatedData: number[] = [];
    const interval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    // Sort transactions by time
    const sortedTransactions = this._transactions.sort((a, b) => new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime());

    if (sortedTransactions.length === 0) {
      return; // No transactions to display
    }

    let currentIntervalStart = new Date(sortedTransactions[0].transactionTime).getTime(); // Start with the first transaction time
    let currentIntervalEnd = currentIntervalStart + interval;
    let currentSum = 0;

    sortedTransactions.forEach(transaction => {
      const transactionTime = new Date(transaction.transactionTime).getTime();
      while (transactionTime >= currentIntervalEnd) {
        aggregatedData.push(currentSum);
        currentSum = 0;
        currentIntervalStart = currentIntervalEnd;
        currentIntervalEnd += interval;
      }
      currentSum += transaction.value;
    });
    aggregatedData.push(currentSum); // Push the last interval sum

    this.chart = new Chart("MyChart", {
      type: 'line',
      data: {
        labels: aggregatedData.map((_, index) => currentIntervalStart + index * interval), // X-axis labels starting from the first transaction time
        datasets: [
          {
            label: "Summed Transaction Values",
            data: aggregatedData,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        aspectRatio: 2.3,
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Time Intervals (2 hours)',
              font: {
                size: 24,
                weight: 'bold',
                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              },
              padding: {
                top: 10,
                bottom: 30
              }
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Summed Values',
              font: {
                size: 24,
                weight: 'bold',
                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              },
              padding: {
                top: 10,
                bottom: 30
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 16,
                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              }
            }
          },
          tooltip: {
            titleFont: {
              size: 18,
              weight: 'bold',
              family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            },
            bodyFont: {
              size: 16,
              family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            }
          }
        }
      }
    });
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
      for (const student of this._students) {
        const bonsForStudent = await lastValueFrom(this.restService.getBonsForStudent(student.studentId));
        if (bonsForStudent.length > 0) {
          const existingBon = bonsForStudent[0];
          await lastValueFrom(this.restService.updateBonForStudent(
            existingBon.id,
            this.voucherForm.value.from,
            this.voucherForm.value.to,
            this.voucherForm.value.hoehe,
            0
          ));
          console.log(`Bon für Student ${student.studentId} wurde aktualisiert.`);
        } else {
          await lastValueFrom(this.restService.addBonForStudent(
            student.studentId,
            this.voucherForm.value.from,
            this.voucherForm.value.to,
            this.voucherForm.value.hoehe
          ));
          console.log(`Neuer Bon für Student ${student.studentId} wurde erstellt.`);
        }
      } 
      alert(`Bons in der höhe von ${this.voucherForm.value.hoehe}€ wurden erfolgreich erstellt`);   
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