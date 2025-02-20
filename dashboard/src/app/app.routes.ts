// src/app/app.routes.ts
import { RouterModule, Routes } from '@angular/router';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { GuthabenVerwaltungComponent } from './guthaben-verwaltung/guthaben-verwaltung.component';
import { BonManagementForStudentComponent } from './bon-management-for-student/bon-management-for-student.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from 'src/core/util/auth-guard';
import { UserManagementComponent } from './user-managment/user-managment.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { NotAllowedPageComponent } from './not-allowed-page/not-allowed-page.component';

export const routes: Routes = [
  
    {path: '', redirectTo: '/studentsOverview', pathMatch: 'full'},
    {path: 'studentsOverview', component: StudentOverviewComponent, canActivate: [AuthGuard]},
    {path: 'guthabenVerwaltung', component: GuthabenVerwaltungComponent, canActivate: [AuthGuard]},
    {path: 'bonManagementForStudent/:id', component: BonManagementForStudentComponent, canActivate: [AuthGuard]},
    {path: 'userManagement', component: UserManagementComponent, canActivate: [AuthGuard]},
    {path: 'student-detail/:id', component: StudentDetailComponent, canActivate: [AuthGuard]},
    {path: 'not-allowed-page', component: NotAllowedPageComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }