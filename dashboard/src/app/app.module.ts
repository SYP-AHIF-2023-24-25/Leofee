import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { GuthabenVerwaltungComponent } from './guthaben-verwaltung/guthaben-verwaltung.component';
import { AddStudentDialog } from './student-overview/student-overview.component';
import { BonManagementForStudentComponent } from './bon-management-for-student/bon-management-for-student.component'; // EditBalanceDialog hinzugefügt
import {AddBonForStudentDialog} from './bon-management-for-student/bon-management-for-student.component'; // AddBonForStudentDialog hinzugefügt

@NgModule({
  declarations: [
    AppComponent,
    StudentOverviewComponent,
    LoginPageComponent,
    SignupPageComponent,
    GuthabenVerwaltungComponent,
    AddStudentDialog,
    BonManagementForStudentComponent,
    AddBonForStudentDialog
   // DialogFormComponent // DialogFormComponent hinzugefügt
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
