import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { GiftCardComponent } from './gift-card/gift-card.component';
import { ProfileKeycloakComponent } from './profile-keycloak/profile-keycloak.component';

export const routes: Routes = [
    {path: '', redirectTo:'/login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'gift-card', component: GiftCardComponent},
    {path: 'profile-keycloak', component: ProfileKeycloakComponent}
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }