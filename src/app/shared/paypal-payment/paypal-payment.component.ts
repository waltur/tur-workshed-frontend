import {
  Component,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';

import { PaypalService } from '../../services/paypal.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paypal-payment',
  templateUrl: './paypal-payment.component.html',
  styleUrls: ['./paypal-payment.component.css']
})
export class PaypalPaymentComponent implements AfterViewInit {

  @Output() paymentSuccess = new EventEmitter<any>();

  processingPayment = false;
  paymentCompleted = false;

  paypalOrderId = '';
  paypalCaptureId = '';

  // Por ahora mantenemos el valor que ya utilizas
  membershipAmount = 1;

  constructor(
    private paypalService: PaypalService
  ) {}



  ngAfterViewInit(): void {
    this.loadPaypalButtons();
  }

  loadPaypalButtons(): void {

    const paypal = (window as any).paypal;

    if (!paypal) {
      console.error('PayPal SDK not loaded');

      Swal.fire({
        icon: 'error',
        title: 'PayPal unavailable',
        text: 'PayPal could not be loaded. Please try again.'
      });

      return;
    }

    const container =
      document.getElementById('paypal-button-container');

    if (!container) {
      console.error(
        'paypal-button-container not found'
      );

      return;
    }

    // Evitar botones duplicados
    container.innerHTML = '';

    paypal.Buttons({

      createOrder: async () => {

        const response = await firstValueFrom(
          this.paypalService.createOrder(
            this.membershipAmount
          )
        );

        return response.id;
      },

      onApprove: async (data: any) => {

        try {

          this.processingPayment = true;

          const result = await firstValueFrom(
            this.paypalService.captureOrder(
              data.orderID
            )
          );

          this.paypalOrderId =
            result.orderID;

          this.paypalCaptureId =
            result.captureID;

          this.paymentCompleted = true;

          this.processingPayment = false;

          Swal.fire({
            icon: 'success',
            title: 'Payment successful',
            text: 'Your membership payment has been completed.',
            confirmButtonColor: '#e91e63'
          });

          // Avisar al componente padre
          this.paymentSuccess.emit({
            orderID: result.orderID,
            captureID: result.captureID,
            amount: result.amount,
            currency: result.currency
          });

        } catch (error) {

          console.error(
            'PayPal capture error:',
            error
          );

          this.processingPayment = false;

          Swal.fire({
            icon: 'error',
            title: 'Payment failed',
            text: 'Unable to verify payment.',
            confirmButtonColor: '#e91e63'
          });

        }

      },

      onCancel: () => {

        Swal.fire({
          icon: 'info',
          title: 'Payment cancelled',
          text: 'The PayPal payment was cancelled.'
        });

      },

      onError: (err: any) => {

        console.error(
          'PayPal error:',
          err
        );

        Swal.fire({
          icon: 'error',
          title: 'PayPal Error',
          text: 'An unexpected error occurred.',
          confirmButtonColor: '#e91e63'
        });

      }

    })
    .render('#paypal-button-container')
    .then(() => {

      console.log(
        'PayPal Buttons Rendered'
      );

    });

  }




}
