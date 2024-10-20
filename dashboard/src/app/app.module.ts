import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { FormsModule } from '@angular/forms';

//import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { GuthabenVerwaltungComponent } from './guthaben-verwaltung/guthaben-verwaltung.component';
import { AddStudentDialog } from './student-overview/student-overview.component';
import { BonManagementForStudentComponent } from './bon-management-for-student/bon-management-for-student.component'; // EditBalanceDialog hinzugefügt
import {AddBonForStudentDialog} from './bon-management-for-student/bon-management-for-student.component'; // AddBonForStudentDialog hinzugefügt
import { ImportDialog } from './student-overview/student-overview.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { AppRoutingModule } from './app.routes';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './app.config';
import { UserManagementComponent } from './user-managment/user-managment.component';

@NgModule({
  declarations: [
    AppComponent,
    StudentOverviewComponent,
    GuthabenVerwaltungComponent,
    AddStudentDialog,
    BonManagementForStudentComponent,
    AddBonForStudentDialog,
    ImportDialog,
    UserManagementComponent,
    StudentDetailComponent
   // DialogFormComponent // DialogFormComponent hinzugefügt
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
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
    KeycloakAngularModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
