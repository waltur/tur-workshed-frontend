import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { PayPalButtonComponent } from './components/payPal/pay-pal-button/pay-pal-button.component';

import { provideNgxMask } from 'ngx-mask';
import { TokenRefreshInterceptor } from './services/token-refresh.interceptor';
import { MembershipComponent } from './pages/membership/membership.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MyDocumentComponent } from './pages/my-document/my-document.component';
import { DocumentManagementComponent } from './pages/document-management/document-management.component';
import { FormsModule } from '@angular/forms';
import { DocumentFolderManagementComponent } from './components/document-folder-management/document-folder-management.component';
import { MatMenuModule } from '@angular/material/menu';




@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    PayPalButtonComponent,
    MembershipComponent,
    MyDocumentComponent,
    DocumentManagementComponent,
    DocumentFolderManagementComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    MatMenuModule

  ],
  providers: [
    provideNgxMask(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenRefreshInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
