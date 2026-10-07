import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { QRCodeModule } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';
import { MyQrComponent } from './pages/my-qr/my-qr.component';

@NgModule({
  declarations: [DashboardComponent, MyQrComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    QRCodeModule,
    FormsModule
  ]
})
export class DashboardModule { }
