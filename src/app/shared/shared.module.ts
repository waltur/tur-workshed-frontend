import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PhoneInputComponent } from './phone-input/phone-input.component';
import { PaypalPaymentComponent } from './paypal-payment/paypal-payment.component';

@NgModule({
  declarations: [
    PhoneInputComponent,
    PaypalPaymentComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PhoneInputComponent,
    PaypalPaymentComponent
  ]
})
export class SharedModule { }
