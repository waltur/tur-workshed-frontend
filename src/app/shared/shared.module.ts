import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PhoneInputComponent } from './phone-input/phone-input.component';

@NgModule({
  declarations: [
    PhoneInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PhoneInputComponent
  ]
})
export class SharedModule { }
