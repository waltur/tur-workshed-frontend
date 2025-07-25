import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenRefreshInterceptor } from './services/token-refresh.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayPalButtonComponent } from './components/payPal/pay-pal-button/pay-pal-button.component';

//import { FilterPipe } from './shared/filter.pipe';







@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    PayPalButtonComponent,

   // FilterPipe,





  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,




  ],
  providers: [ {
                  provide: HTTP_INTERCEPTORS,
                  useClass: TokenRefreshInterceptor,
                  multi: true
                }],
  bootstrap: [AppComponent]
})
export class AppModule { }
