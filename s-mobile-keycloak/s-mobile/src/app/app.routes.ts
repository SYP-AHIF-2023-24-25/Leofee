import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { ProfileKeycloakComponent } from './profile-keycloak/profile-keycloak.component';
import { AuthGuard } from '../core/util/auth-guard';
import { LeoUser, Role } from '../core/util/leo-token';

/* export const routes: Routes = [
    {path: '', 
        component: LoginComponent,
        canActivate: [AuthGuard],
        data: {
            roles: [Role.Student]
    } 
    },
    {path: 'login',
     component: LoginComponent,
     canActivate: [AuthGuard],
    data: {
        roles: [Role.Student]
    }
    },
    //{path: 'gift-card', component: GiftCardComponent},
    {path: 'profile-keycloak',
     component: ProfileKeycloakComponent,
     canActivate: [AuthGuard],
     data: {
         roles: [Role.Student]
     }
    }
]; */

export const routes: Routes = [
    {path:'', redirectTo:'/profile-keycloak', pathMatch:'full'},
    {path:'login', component: LoginComponent},
    {
        path: 'profile-keycloak',
        component: ProfileKeycloakComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }