import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { GuthabenVerwaltungComponent } from './guthaben-verwaltung/guthaben-verwaltung.component';
import { BonManagementForStudentComponent } from './bon-management-for-student/bon-management-for-student.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';


const routes: Routes = [
  
  {path: '', redirectTo: '/loginPage', pathMatch: 'full'},
  {path: 'studentsOverview', component: StudentOverviewComponent},
  {path: 'guthabenVerwaltung', component: GuthabenVerwaltungComponent},
  {path: 'bonManagementForStudent/:id', component: BonManagementForStudentComponent},
  {path: 'student-detail/:id', component: StudentDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
