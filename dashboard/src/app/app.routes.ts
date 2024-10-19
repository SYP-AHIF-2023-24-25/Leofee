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
import { UserInWhitelistComponent } from './user-in-whitelist/user-in-whitelist.component';

export const routes: Routes = [
  
    {path: '', redirectTo: '/userInWhitelist', pathMatch: 'full'},
    {path: 'userInWhitelist', component: UserInWhitelistComponent, canActivate: [AuthGuard]},
    //{path: 'loginPage', component: LoginPageComponent, canActivate: [AuthGuard]},
    {path: 'studentsOverview', component: StudentOverviewComponent, canActivate: [AuthGuard]},
    {path: 'signupPage', component: SignupPageComponent, canActivate: [AuthGuard]},
    {path: 'guthabenVerwaltung', component: GuthabenVerwaltungComponent, canActivate: [AuthGuard]},
    {path: 'bonManagementForStudent/:id', component: BonManagementForStudentComponent, canActivate: [AuthGuard]},
    {path: 'userManagement', component: UserManagementComponent, canActivate: [AuthGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }