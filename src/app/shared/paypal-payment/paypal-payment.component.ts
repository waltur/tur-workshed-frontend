import {
  Component,
  AfterViewInit,
  Output,
  EventEmitter,
  Input
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
  @Input() isRegistrationPayment = true;

  processingPayment = false;

  paymentCompleted = false;

  paypalRendered = false;

  paypalOrderId = '';

  paypalCaptureId = '';

  membershipAmount = 1;

  // Protección extra contra doble click / doble captura
  private paymentLocked = false;


  constructor(
    private paypalService: PaypalService
  ) {}


  ngAfterViewInit(): void {

    // Esperamos a que Angular tenga el DOM listo
    setTimeout(() => {

      if (
        !this.paymentCompleted &&
        !this.paypalRendered &&
        !this.paymentLocked
      ) {

        this.loadPaypalButtons();

      }

    }, 0);

  }


  loadPaypalButtons(): void {

    // ==========================================
    // BLOQUEO TOTAL
    // ==========================================

    if (
      this.paymentCompleted ||
      this.processingPayment ||
      this.paypalRendered ||
      this.paymentLocked
    ) {

      console.log(
        'PayPal rendering blocked.'
      );

      return;

    }


    const paypal = (window as any).paypal;


    if (!paypal) {

      console.error(
        'PayPal SDK not loaded'
      );

      Swal.fire({
        icon: 'error',
        title: 'PayPal unavailable',
        text: 'PayPal could not be loaded. Please try again.'
      });

      return;

    }


    const container =
      document.getElementById(
        'paypal-button-container'
      );


    if (!container) {

      console.error(
        'paypal-button-container not found'
      );

      return;

    }


    // Limpiar antes de renderizar
    container.innerHTML = '';


    // ==========================================
    // MARCAR COMO RENDERIZADO INMEDIATAMENTE
    // ==========================================

    this.paypalRendered = true;


    paypal.Buttons({


      // ==========================================
      // CREAR ORDEN
      // ==========================================

      createOrder: async () => {

        if (
          this.paymentCompleted ||
          this.processingPayment ||
          this.paymentLocked
        ) {

          throw new Error(
            'Payment is already completed or processing.'
          );

        }


        const response =
          await firstValueFrom(

            this.paypalService.createOrder(
              this.membershipAmount
            )

          );


        return response.id;

      },


      // ==========================================
      // PAGO APROBADO
      // ==========================================

      onApprove: async (data: any) => {

        if (
          this.paymentCompleted ||
          this.processingPayment ||
          this.paymentLocked
        ) {
          console.log('Duplicate payment attempt blocked.');
          return;
        }

        this.paymentLocked = true;
        this.processingPayment = true;

        try {

          let result: any;

          // ==========================================
          // NUEVO USUARIO
          // NO TIENE TOKEN
          // ==========================================

          if (this.isRegistrationPayment) {

            result = await firstValueFrom(
              this.paypalService.captureRegistrationOrder(
                data.orderID
              )
            );

          } else {

            // ==========================================
            // USUARIO YA REGISTRADO
            // TIENE JWT / TOKEN
            // ==========================================

            result = await firstValueFrom(
              this.paypalService.captureOrder(
                data.orderID
              )
            );

          }


          this.paypalOrderId = result.orderID;
          this.paypalCaptureId = result.captureID;

          // 🔒 Marcar inmediatamente como completado
          this.paymentCompleted = true;
          this.processingPayment = false;


          this.paymentSuccess.emit({
            orderID: result.orderID,
            captureID: result.captureID,
            amount: result.amount,
            currency: result.currency
          });


          Swal.fire({
            icon: 'success',
            title: 'Payment successful',
            text: 'Your membership payment has been completed.',
            confirmButtonColor: '#e91e63',
            allowOutsideClick: false,
            allowEscapeKey: false
          });

        } catch (error) {

          console.error('PayPal capture error:', error);

          this.processingPayment = false;

          // Solo desbloquear porque el pago falló
          this.paymentLocked = false;

          Swal.fire({
            icon: 'error',
            title: 'Payment failed',
            text: 'Unable to verify payment. Please try again.',
            confirmButtonColor: '#e91e63'
          });

        }

      },


      // ==========================================
      // CANCELADO
      // ==========================================

      onCancel: () => {

        this.processingPayment = false;

        // No desbloqueamos paypalRendered porque
        // el mismo botón puede seguir utilizándose

        Swal.fire({

          icon: 'info',

          title: 'Payment cancelled',

          text:
            'The PayPal payment was cancelled.'

        });

      },


      // ==========================================
      // ERROR PAYPAL
      // ==========================================

      onError: (err: any) => {

        console.error(
          'PayPal error:',
          err
        );


        this.processingPayment = false;


        if (!this.paymentCompleted) {

          this.paymentLocked = false;

        }


        Swal.fire({

          icon: 'error',

          title: 'PayPal Error',

          text:
            'An unexpected error occurred.',

          confirmButtonColor:
            '#e91e63'

        });

      }


    })
    .render(
      '#paypal-button-container'
    )
    .then(() => {

      console.log(
        'PayPal Buttons Rendered'
      );

    })
    .catch((error: any) => {

      console.error(
        'Error rendering PayPal buttons:',
        error
      );

      this.paypalRendered = false;

      this.paymentLocked = false;

    });

  }

}
