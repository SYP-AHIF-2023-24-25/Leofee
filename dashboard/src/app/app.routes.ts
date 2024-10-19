// src/app/app.routes.ts
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { GuthabenVerwaltungComponent } from './guthaben-verwaltung/guthaben-verwaltung.component';
import { BonManagementForStudentComponent } from './bon-management-for-student/bon-management-for-student.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/core/util/auth-guard';
import { UserManagementComponent } from './user-managment/user-managment.component';

export const routes: Routes = [
  
    {path: '', redirectTo: '/loginPage', pathMatch: 'full'},
    {path: 'studentsOverview', component: StudentOverviewComponent},
    {path: 'loginPage', component: LoginPageComponent, canActivate: [AuthGuard]},
    {path: 'signupPage', component: SignupPageComponent},
    {path: 'guthabenVerwaltung', component: GuthabenVerwaltungComponent},
    {path: 'bonManagementForStudent/:id', component: BonManagementForStudentComponent},
    {path: 'userManagement', component: UserManagementComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }