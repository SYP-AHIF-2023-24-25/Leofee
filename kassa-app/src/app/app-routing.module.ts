import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KassaComponent } from './kassa/kassa.component';

const routes: Routes = [
  { path: '', component: KassaComponent, pathMatch: 'full' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
