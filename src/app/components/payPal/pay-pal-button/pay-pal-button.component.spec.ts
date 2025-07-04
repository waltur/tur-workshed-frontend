import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayPalButtonComponent } from './pay-pal-button.component';

describe('PayPalButtonComponent', () => {
  let component: PayPalButtonComponent;
  let fixture: ComponentFixture<PayPalButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayPalButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayPalButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
