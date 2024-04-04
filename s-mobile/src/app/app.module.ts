import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QrCodeGeneratorComponent } from './qr-code-generator/qr-code-generator.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { GiftCardComponent } from './gift-card/gift-card.component';
import { MsalModule } from '@azure/msal-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalInterceptor, MsalInterceptorConfiguration, MsalService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';
import { environment } from './environments/environment';
import { MSALInstanceFactory, MSALInterceptorConfigFactory } from './auth/msal';



@NgModule({
  declarations: [
    AppComponent,
    QrCodeGeneratorComponent,
    LoginComponent,
    GiftCardComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    MsalModule,
    HttpClientModule
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
