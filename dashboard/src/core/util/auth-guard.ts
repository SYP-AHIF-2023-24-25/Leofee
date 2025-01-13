import { KeycloakAuthGuard, KeycloakService } from "keycloak-angular";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Inject, Injectable } from "@angular/core";
import { jwtDecode } from "jwt-decode";
import { createLeoUser, LeoUser, Role } from "./leo-token";
import { SharedService } from "src/services/shared.service";
import { WhiteListServiceService } from "src/services/white-list-service.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    router: Router,
    keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    let addDashboardPath = "/dashboard"
    if(window.location.origin.toString().includes("localhost"))
    {
      addDashboardPath = ""
    }
    // Force the user to log in if currently unauthenticated.
    if (!this.authenticated) {
      await this.keycloakAngular.login({
        redirectUri: window.location.origin + addDashboardPath + state.url
      });
    }

    // Get the roles required from the route.
    const requiredRoles: Role[] = route.data["roles"];

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    const leoUser = await createLeoUser(this.keycloakAngular);
    
    // Allow the user to proceed if all the required roles are present.
    return requiredRoles.some((role) => leoUser.hasRole(role));
  }
}
