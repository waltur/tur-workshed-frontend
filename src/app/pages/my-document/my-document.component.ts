import { Component,OnInit} from '@angular/core';
import { DocumentService } from '../../services/document.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-document',
  templateUrl: './my-document.component.html',
  styleUrls: ['./my-document.component.css']
})
export class MyDocumentComponent implements OnInit{


        documents: any[] = [];

        loading = true;

        constructor(
          private documentService: DocumentService
        ) {}

        ngOnInit(): void {

          this.loadDocuments();

        }


        // ==========================================
        // LOAD DOCUMENTS
        // ==========================================

        loadDocuments(): void {

          this.loading = true;

          this.documentService
            .getMyDocuments()
            .subscribe({

              next: (response) => {

                console.log(
                  'MY DOCUMENTS:',
                  response
                );

                this.documents =
                  response.documents || [];

                this.loading = false;

              },

              error: (error) => {

                console.error(
                  'Error loading documents:',
                  error
                );

                this.loading = false;

                Swal.fire({
                  icon: 'error',
                  title: 'Unable to load documents',
                  text: 'We could not load your documents.'
                });

              }

            });

        }


        // ==========================================
        // OPEN DOCUMENT
        // ==========================================

        openDocument(document: any): void {

          if (!document.file_url) {

            Swal.fire({
              icon: 'warning',
              title: 'Document unavailable',
              text: 'This document does not have a file available.'
            });

            return;

          }

          window.open(
            document.file_url,
            '_blank'
          );

        }


        // ==========================================
        // ACCEPT DOCUMENT
        // ==========================================

        acceptDocument(document: any): void {

          Swal.fire({

            title: 'Accept document?',

            text:
              `You are accepting "${document.title}".`,

            icon: 'question',

            showCancelButton: true,

            confirmButtonText: 'Yes, I accept',

            cancelButtonText: 'Cancel',

            confirmButtonColor: '#f97316'

          }).then((result) => {

            if (!result.isConfirmed) {
              return;
            }

            this.documentService
              .acceptDocument(document.id_document)
              .subscribe({

                next: (response) => {

                  console.log(
                    'DOCUMENT ACCEPTED:',
                    response
                  );

                  Swal.fire({

                    icon: 'success',

                    title: 'Document accepted',

                    text:
                      'Your acceptance has been recorded.',

                    confirmButtonColor: '#f97316'

                  });

                  // Recargar para actualizar
                  // Accepted / Pending

                  this.loadDocuments();

                },

                error: (error) => {

                  console.error(
                    'Error accepting document:',
                    error
                  );

                  Swal.fire({

                    icon: 'error',

                    title: 'Unable to accept',

                    text:
                      error?.error?.error ||
                      'The document could not be accepted.'

                  });

                }

              });

          });

        }



}
