import { Component, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-capture',
  templateUrl: './signature-capture.component.html',
  styleUrls: ['./signature-capture.component.css']
})
export class SignatureCaptureComponent implements AfterViewInit {
  @ViewChild('signatureCanvas') signatureCanvas: any;
  @Output() signatureCompleted = new EventEmitter<string>();

  signaturePad!: SignaturePad;


ngAfterViewInit(): void {
  const canvas = this.signatureCanvas.nativeElement;

  // Ajusta el tamaño según el contenedor
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;

  this.signaturePad = new SignaturePad(canvas);
}

  clearSignature(): void {
    this.signaturePad.clear();
  }

  saveSignature(): void {
    if (this.signaturePad.isEmpty()) {
      alert("Por favor firme antes de guardar.");
      return;
    }

    const dataURL = this.signaturePad.toDataURL();
    this.signatureCompleted.emit(dataURL);
  }
}
