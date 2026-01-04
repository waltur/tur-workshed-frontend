import { Component, EventEmitter, Input, Output } from '@angular/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

interface Country {
  name: string;
  iso2: string;
  dialCode: string;
}

@Component({
  selector: 'phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.css']
})
export class PhoneInputComponent {

  @Input() label = 'Phone Number';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  selectedCountry: Country = { name: 'Australia', iso2: 'AU', dialCode: '+61' };
  phoneNumber: string = '';
  isValid: boolean = true;

  countries: Country[] = [
    { name: 'Australia', iso2: 'AU', dialCode: '+61' },
    { name: 'Ecuador', iso2: 'EC', dialCode: '+593' },
    { name: 'United States', iso2: 'US', dialCode: '+1' },
    { name: 'United Kingdom', iso2: 'GB', dialCode: '+44' },
    { name: 'New Zealand', iso2: 'NZ', dialCode: '+64' },
  ];

  ngOnInit() {
    if (this.value) {
      this.phoneNumber = this.value.replace(this.selectedCountry.dialCode, '');
    }
  }

  updateNumber() {
    const fullNumber = this.selectedCountry.dialCode + this.phoneNumber;

    // VALIDACIÓN con libphonenumber-js
    const parsed = parsePhoneNumberFromString(fullNumber);

    this.isValid = parsed?.isValid() ?? false;

   if (parsed && parsed.isValid()) {
     this.isValid = true;
     this.valueChange.emit(parsed.number); // E.164 format
   } else {
     this.isValid = false;
     this.valueChange.emit('');
   }

  }
}
