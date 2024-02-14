import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QrCodeGeneratorComponent } from './qr-code-generator/qr-code-generator.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', component: QrCodeGeneratorComponent },
  { path: 'qr-code', component: QrCodeGeneratorComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
