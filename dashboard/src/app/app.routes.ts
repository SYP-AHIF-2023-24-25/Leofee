// src/app/app.routes.ts
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { GuthabenVerwaltungComponent } from './guthaben-verwaltung/guthaben-verwaltung.component';
import { BonManagementForStudentComponent } from './bon-management-for-student/bon-management-for-student.component';
import { NgModel } from '@angular/forms';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  
    {path: '', redirectTo: '/loginPage', pathMatch: 'full'},
    {path: 'studentsOverview', component: StudentOverviewComponent},
    {path: 'loginPage', component: LoginPageComponent},
    {path: 'signupPage', component: SignupPageComponent},
    {path: 'guthabenVerwaltung', component: GuthabenVerwaltungComponent},
    {path: 'bonManagementForStudent/:id', component: BonManagementForStudentComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }