import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QrCodeGeneratorComponent } from './qr-code-generator/qr-code-generator.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { GiftCardComponent } from './gift-card/gift-card.component';

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
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
