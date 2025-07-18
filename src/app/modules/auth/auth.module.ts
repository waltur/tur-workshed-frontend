import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
import { EmailSentComponent } from './components/email-sent/email-sent.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ForgotPasswordComponent, ResetPasswordComponent, VerifyEmailComponent, EmailSentComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,

  ]
})
export class AuthModule { }
