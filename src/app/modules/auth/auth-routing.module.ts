import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [{ path: '', component: LoginComponent },
                        { path: 'register', component: RegisterComponent },
                        { path: 'forgot-password', component: ForgotPasswordComponent },
                         { path: 'reset-password/:token', component: ResetPasswordComponent }
                        ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
