import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StudentOverviewComponent } from './student-overview/student-overview.component';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatOptionModule } from '@angular/material/core';



@NgModule({
  declarations: [
    AppComponent,
    StudentOverviewComponent
  ],
  imports: [
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
