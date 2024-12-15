# Documentation: Authentication with Microsoft Azure with Angular

### Angular
Before you start, check if you have these applications on a version which is equal or above:

Angular CLI: 17.2.0
Node: 21.6.2 (Unsupported)
Package Manager: npm 9.1.2
Typescript: Version 5.1.3


## Microsoft Azure

### Register a Client-App

1. Go Mircosofts [Azure](https://portal.azure.com/#home)
2. Login with your Microsoft-account from School
3. Click of Microsoft Entra ID and the "HTBLA Leonding | Overview" will appear
4. Go on App registrations and click on "New registration" to create a new client
5. Register new application: 
   * type in your name for this client
   * under "Supported account types" chose ==Accounts in this organizational directory only (HTBLA Leonding only - Single tenant)==
   * press on Register
6. Now you should be on the Overview of your Application
7. This page shows your Client ID and your Tentant ID
   * Client ID: exclusive ID of your Application
   * Tentant ID: Azure ID of out school

### Setting of API
1. From the Overview of your application, click on ==Authentication==
2. Click on ==Add a platform==
3. Go on Single-page application 
4. Under "Redirect URIs" insert this address "http://localhost:4200"
5. click on "Configure"
6. The single-page application is added
7. Go on "API permissions"
8. Steps on this page:
   * Click on "Add a permission"
   * On "Microsoft Graph"
   * Go on "Delegated permissions"
   * add following permissions:
     + offline_access
     + openid
     + profile
     + User.Read
     + User.ReadBasic.All 
   * if you have done it, click on "Add permissions"
9.  To test your API, go on [Microsoft Graph Explorer]("https://developer.microsoft.com/en-us/graph/graph-explorer")
### WARNING: check if you require Admin consent for the Api-permissions!!!

## Create an Angular Client App
1. Insert `npm install -g @angular/cli` into your terminal, to update your Angular-CLI
2. Create a new folder named "Auth" in your Github repo or your directory and change directory to "Auth"
3. Create App with this command: `ng new aad-auth --minimal --skip-git --style css --strict --directory --no-standalone` and press Enter
   * Answer "No" to refuse Server-Side Rendering and Static Site Generation
4. go into your new created angular folder "aad-auth"
5. Installations:
   *  `npm i @azure/msal-angular`
   *  `npm i @azure/msal-browser`
6. open your app in Visual Studio Code by the command `code .`
7. Run `ng g environments` in your terminal, to add the enviroments-folder
8. Add this code in both of your environments files: 
* == environment.development.ts == 
``` typescript 
    export const environment = {
        development: true,
        addClientId: '[Client ID of your Azure Application]',
        addTenantId: '91fc072c-edef-4f97-bdc5-cfb67718ae3a'};
```

* ==environment.ts==
``` typescript 
    export const environment = {
        development: true,
        addClientId: '[Client ID of your Azure Application]',
        addTenantId: '91fc072c-edef-4f97-bdc5-cfb67718ae3a'};
```

## Code implementation go logging

1. Create "msal.ts" inside your app folder and add the following and paste the following code into the file
   * msal.ts
``` typescript
import { MsalInterceptorConfiguration } from "@azure/msal-angular";
import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication,
} from "@azure/msal-browser";
import { environment } from "../environments/environment";

// Create a client application for a configured AAD app
// For more details see https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_browser.publicclientapplication.html
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.addClientId,
      authority: `https://login.microsoftonline.com/${environment.addTenantId}`,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();

  // Define which permissions (=scopes) we need for Microsoft Graph
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/', [
    'User.Read',
    'User.ReadBasic.All',
  ]);

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}
```
2. Code for app.module.ts:
``` typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MsalModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
``` 
3. Add this code to your app.component.ts
   * app.component.ts
```typescript
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css'
})
export class AppComponent implements OnInit{
  loggedIn: boolean = false;
  profile?: MicrosoftGraph.User;
  title = 'aad-auth';

  constructor(private authService: MsalService, private client: HttpClient) {
    this.initializeMSAL();
  }

  ngOnInit(): void {
    this.checkAccount();
  }

  checkAccount() {
    this.loggedIn = this.authService.instance.getAllAccounts().length > 0;
  }

  async initializeMSAL() {
    await this.authService.initialize();
  }

  login() {
    this.authService
      .loginPopup()
      .subscribe((response: AuthenticationResult) => {
        this.authService.instance.setActiveAccount(response.account);
        this.checkAccount();
      });
  }

  logout() {
    this.authService.logoutPopup();
    this.loggedIn = false;
  }
}
```  
4. Create app.component.html and add following code:
   * app.component.html
``` HTML
<div class="center-content">
    <h1>Login-Screen</h1>
    <div *ngIf="loggedIn == false; else logOutBlock">
        <h3>You are logged out!!!</h3>
        <button (click)="login()">Login</button>
    </div>
    <ng-template #logOutBlock>
        <h3>You are already logged in!!!</h3>
        <button (click)="logout()">Logout</button>
    </ng-template>
</div>
```


If you want a more detailed toturial, watch this Youtube-video from [Prof. Rainer Stropek](https://github.com/rstropek).
The link to the video: [https://youtu.be/ND6EKbGb7vQ?si=DjH8qMus4mAiSw9n](https://youtu.be/ND6EKbGb7vQ?si=DjH8qMus4mAiSw9n)

**WARNING:**
This toturial includes a lots of differences comparing to mine, because of the different Angualr-version.
