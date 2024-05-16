import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { GiftCardComponent } from './gift-card/gift-card.component';
import { ProfileKeycloakComponent } from './profile-keycloak/profile-keycloak.component';
import { AuthGuard } from '../core/util/auth-guard';
import { LeoUser, Role } from '../core/util/leo-token';

export const routes: Routes = [
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
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }