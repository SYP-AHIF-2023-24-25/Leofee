import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SignupPageComponent } from './signup-page/signup-page.component';


const routes: Routes = [
  
  {path: '', redirectTo: '/loginPage', pathMatch: 'full'},
  {path: 'studentsOverview', component: StudentOverviewComponent},
  {path: 'loginPage', component: LoginPageComponent},
  {path: 'signupPage', component: SignupPageComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
