import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentOverviewComponent } from './student-overview/student-overview.component';


const routes: Routes = [
  
  {path: '', redirectTo: '/studentsOverview', pathMatch: 'full'},
  {path: 'studentsOverview', component: StudentOverviewComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
