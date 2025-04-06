import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProfileKeycloakComponent } from './profile-keycloak/profile-keycloak.component';
import { AuthGuard } from '../core/util/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/profile-keycloak', pathMatch: 'full' },
  {
    path: 'profile-keycloak',
    component: ProfileKeycloakComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
