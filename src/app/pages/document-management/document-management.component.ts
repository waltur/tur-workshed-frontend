import { Component, OnInit } from '@angular/core';

import {
  DocumentModel,
  DocumentFolder,
  DocumentService
} from '../../services/document.service';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-document-management',
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css']
})
export class DocumentManagementComponent implements OnInit {

  documents: DocumentModel[] = [];

  loading = false;
  uploading = false;

  showUploadForm = false;
  showEditForm = false;

  selectedFile: File | null = null;

  editingDocument: DocumentModel | null = null;

  folders: DocumentFolder[] = [];

  selectedFolderId: number | null = null;

  loadingFolders = false;

  showFolderForm = false;

  editingFolder: DocumentFolder | null = null;
  currentFolder: DocumentFolder | null = null;

  folderStack: DocumentFolder[] = [];

  showAllDocuments = true;

  folderForm = {
    name: '',
    description: '',
    parent_id: null as number | null
  };

  form = {
    title: '',
    description: '',
    document_type: 'membership',
    version: '1.0',
    audience: 'everyone',
    requires_acceptance: true,
    id_folder: null as number | null
  };

  constructor(
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.loadFolders();
    this.loadDocuments();

  }

  // =====================================================
  // LOAD
  // =====================================================

  loadDocuments(): void {

    this.loading = true;

    this.documentService.getAllDocuments()
      .subscribe({

        next: (documents) => {

          this.documents = documents;

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
            text: 'Please try again later.'
          });

        }

      });

  }
// =====================================================
// LOAD FOLDERS
// =====================================================

loadFolders(): void {

  this.loadingFolders = true;

  this.documentService
    .getAllFolders()
    .subscribe({

      next: (response) => {

        this.folders =
          response.folders || [];

        this.loadingFolders = false;

      },

      error: (error) => {

        console.error(
          'Error loading folders:',
          error
        );

        this.loadingFolders = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to load folders',
          text: 'Please try again later.'
        });

      }

    });

}

  // =====================================================
  // OPEN UPLOAD
  // =====================================================

 openUploadForm(): void {

   this.resetForm();

   this.form.id_folder =
     this.currentFolder?.id_folder ?? null;

   this.showUploadForm = true;

 }
 get unfiledDocuments(): DocumentModel[] {

   return this.documents.filter(
     document =>
       document.id_folder === null
   );

 }

  // =====================================================
  // CLOSE UPLOAD
  // =====================================================

  closeUploadForm(): void {

    if (this.uploading) {
      return;
    }

    this.showUploadForm = false;

    this.selectedFile = null;

  }

  // =====================================================
  // FILE SELECT
  // =====================================================

  onFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedFile = null;

      return;

    }

    const file = input.files[0];

    const allowedTypes = [

      'application/pdf',

     // 'application/msword',

    //  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    ];

    if (!allowedTypes.includes(file.type)) {

      Swal.fire({
        icon: 'warning',
        title: 'Invalid file',
        //text: 'Only PDF, DOC and DOCX files are allowed.'
         text: 'Only PDF files are allowed.'
      });

      input.value = '';

      this.selectedFile = null;

      return;

    }

    this.selectedFile = file;

  }

  // =====================================================
  // UPLOAD
  // =====================================================

  uploadDocument(): void {

    if (!this.form.title.trim()) {

      Swal.fire({
        icon: 'warning',
        title: 'Title required',
        text: 'Please enter a document title.'
      });

      return;

    }

    if (!this.form.document_type) {

      Swal.fire({
        icon: 'warning',
        title: 'Document type required'
      });

      return;

    }

    if (!this.selectedFile) {

      Swal.fire({
        icon: 'warning',
        title: 'Document required',
        text: 'Please select a file.'
      });

      return;

    }

    const formData = new FormData();

    formData.append(
      'file',
      this.selectedFile
    );

    formData.append(
      'title',
      this.form.title
    );

    formData.append(
      'description',
      this.form.description
    );

    formData.append(
      'document_type',
      this.form.document_type
    );

    formData.append(
      'version',
      this.form.version
    );

    formData.append(
      'audience',
      this.form.audience
    );

    formData.append(
      'requires_acceptance',
      String(this.form.requires_acceptance)
    );
      formData.append(
        'id_folder',
        this.form.id_folder !== null
          ? String(this.form.id_folder)
          : ''
      );

    this.uploading = true;

    this.documentService
      .uploadDocument(formData)
      .subscribe({

        next: () => {

          this.uploading = false;

          this.showUploadForm = false;

          this.selectedFile = null;

          this.resetForm();

          Swal.fire({
            icon: 'success',
            title: 'Document uploaded',
            text: 'The document has been added successfully.',
            confirmButtonColor: '#f97316'
          });

          this.loadDocuments();

        },

        error: (error) => {

          console.error(
            'Upload error:',
            error
          );

          this.uploading = false;

          Swal.fire({
            icon: 'error',
            title: 'Upload failed',
            text:
              error?.error?.error ||
              'Unable to upload the document.'
          });

        }

      });

  }

  // =====================================================
  // EDIT
  // =====================================================

  openEdit(document: DocumentModel): void {

    this.editingDocument = document;

    this.form = {

      title: document.title,

      description:
        document.description || '',

      document_type:
        document.document_type,

      version:
        document.version,

      audience:
        document.audience,

      requires_acceptance:
        document.requires_acceptance,

      id_folder: document.id_folder

    };

    this.showEditForm = true;

  }

  // =====================================================
  // UPDATE
  // =====================================================

  updateDocument(): void {

    if (!this.editingDocument) {
      return;
    }

    if (!this.form.title.trim()) {

      Swal.fire({
        icon: 'warning',
        title: 'Title required'
      });

      return;

    }

    this.loading = true;

    this.documentService
      .updateDocument(
        this.editingDocument.id_document,
        this.form
      )
      .subscribe({

        next: () => {

          this.loading = false;

          this.showEditForm = false;

          this.editingDocument = null;

          Swal.fire({
            icon: 'success',
            title: 'Document updated',
            confirmButtonColor: '#f97316'
          });

          this.loadDocuments();

        },

        error: (error) => {

          console.error(
            'Update error:',
            error
          );

          this.loading = false;

          Swal.fire({
            icon: 'error',
            title: 'Update failed',
            text:
              error?.error?.error ||
              'Unable to update document.'
          });

        }

      });

  }

  // =====================================================
  // STATUS
  // =====================================================

  toggleStatus(
    document: DocumentModel
  ): void {

    const newStatus =
      !document.is_active;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';

    Swal.fire({

      icon: 'question',

      title:
        `${this.capitalize(action)} document?`,

      text:
        newStatus
          ? 'Users will be able to see this document.'
          : 'Users will no longer see this document.',

      showCancelButton: true,

      confirmButtonText:
        `Yes, ${action}`,

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        newStatus
          ? '#16a34a'
          : '#dc2626'

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.documentService
        .updateDocumentStatus(
          document.id_document,
          newStatus
        )
        .subscribe({

          next: () => {

            document.is_active =
              newStatus;

            Swal.fire({
              icon: 'success',
              title:
                newStatus
                  ? 'Document activated'
                  : 'Document deactivated',
              timer: 1500,
              showConfirmButton: false
            });

          },

          error: (error) => {

            console.error(
              'Status error:',
              error
            );

            Swal.fire({
              icon: 'error',
              title: 'Operation failed'
            });

          }

        });

    });

  }

  // =====================================================
  // OPEN DOCUMENT
  // =====================================================

  openDocument(
    document: DocumentModel
  ): void {

    if (!document.file_url) {

      Swal.fire({
        icon: 'warning',
        title: 'Document unavailable'
      });

      return;

    }

    window.open(
      document.file_url,
      '_blank'
    );

  }

  // =====================================================
  // RESET
  // =====================================================

  resetForm(): void {

    this.form = {

      title: '',

      description: '',

      document_type: 'membership',

      version: '1.0',

      audience: 'everyone',

      requires_acceptance: true,
      id_folder: null

    };

  }

  capitalize(value: string): string {

    return value.charAt(0).toUpperCase()
      + value.slice(1);

  }

    // =====================================================
    // SELECT FOLDER
    // =====================================================

    selectFolder(
      folderId: number | null
    ): void {

      this.selectedFolderId = folderId;

    }

  // =====================================================
  // VISIBLE DOCUMENTS
  // =====================================================

get visibleDocuments(): DocumentModel[] {

  if (this.showAllDocuments) {

    return this.documents;

  }

  const folderId =
    this.currentFolder?.id_folder ?? null;

  return this.documents.filter(
    document =>
      document.id_folder === folderId
  );

}
// =====================================================
// OPEN FOLDER FORM
// =====================================================

openFolderForm(): void {

  this.editingFolder = null;

  this.folderForm = {

    name: '',

    description: '',

    parent_id:
      this.currentFolder?.id_folder ?? null

  };

  this.showFolderForm = true;

}
closeFolderForm(): void {

  this.showFolderForm = false;

  this.editingFolder = null;

}
// =====================================================
// SAVE FOLDER
// =====================================================

saveFolder(): void {

  if (!this.folderForm.name.trim()) {

    Swal.fire({
      icon: 'warning',
      title: 'Folder name required'
    });

    return;

  }

  const data = {
    name: this.folderForm.name.trim(),
    description:
      this.folderForm.description.trim(),
    parent_id:
      this.folderForm.parent_id
  };


  // ===================================================
  // CREATE
  // ===================================================

  if (!this.editingFolder) {

    this.loadingFolders = true;

    this.documentService
      .createFolder(data)
      .subscribe({

        next: () => {

          this.loadingFolders = false;

          this.showFolderForm = false;

          Swal.fire({
            icon: 'success',
            title: 'Folder created',
            timer: 1500,
            showConfirmButton: false
          });

          this.loadFolders();

        },

        error: (error) => {

          this.loadingFolders = false;

          console.error(
            'Create folder error:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'Unable to create folder',
            text:
              error?.error?.error ||
              'Please try again.'
          });

        }

      });

    return;

  }


  // ===================================================
  // UPDATE
  // ===================================================

  this.loadingFolders = true;

  this.documentService
    .updateFolder(
      this.editingFolder.id_folder,
      data
    )
    .subscribe({

      next: () => {

        this.loadingFolders = false;

        this.showFolderForm = false;

        this.editingFolder = null;

        Swal.fire({
          icon: 'success',
          title: 'Folder updated',
          timer: 1500,
          showConfirmButton: false
        });

        this.loadFolders();

      },

      error: (error) => {

        this.loadingFolders = false;

        console.error(
          'Update folder error:',
          error
        );

        Swal.fire({
          icon: 'error',
          title: 'Unable to update folder',
          text:
            error?.error?.error ||
            'Please try again.'
        });

      }

    });

}
editFolder(
  folder: DocumentFolder
): void {

  this.editingFolder = folder;

  this.folderForm = {

    name: folder.name,

    description:
      folder.description || '',

    parent_id:
      folder.parent_id

  };

  this.showFolderForm = true;

}
toggleFolderStatus(
  folder: DocumentFolder
): void {

  const newStatus =
    folder.is_active === false;

  const action =
    newStatus
      ? 'activate'
      : 'deactivate';


  Swal.fire({

    icon: 'question',

    title:
      `${newStatus ? 'Activate' : 'Deactivate'} folder?`,

    text:
      newStatus
        ? 'The folder will be available again.'
        : 'The folder will no longer be available.',

    showCancelButton: true,

    confirmButtonText:
      newStatus
        ? 'Activate'
        : 'Deactivate',

    cancelButtonText:
      'Cancel',

    confirmButtonColor:
      newStatus
        ? '#16a34a'
        : '#dc2626'

  }).then(result => {

    if (!result.isConfirmed) {
      return;
    }

    this.documentService
      .updateFolderStatus(
        folder.id_folder,
        newStatus
      )
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title:
              newStatus
                ? 'Folder activated'
                : 'Folder deactivated',
            timer: 1500,
            showConfirmButton: false
          });

          this.loadFolders();

        },

        error: (error) => {

          console.error(
            'Folder status error:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'Operation failed'
          });

        }

      });

  });

}
deleteFolder(
  folder: DocumentFolder
): void {

  Swal.fire({

    icon: 'warning',

    title: 'Delete folder?',

    html: `
      <p>
        Documents inside this folder
        will not be deleted.
      </p>
      <p class="mt-2">
        They will simply become unfiled.
      </p>
    `,

    showCancelButton: true,

    confirmButtonText:
      'Yes, delete',

    cancelButtonText:
      'Cancel',

    confirmButtonColor:
      '#dc2626'

  }).then(result => {

    if (!result.isConfirmed) {
      return;
    }

    this.documentService
      .deleteFolder(
        folder.id_folder
      )
      .subscribe({

        next: () => {

          if (
            this.selectedFolderId ===
            folder.id_folder
          ) {

            this.selectedFolderId = null;

          }

          Swal.fire({
            icon: 'success',
            title: 'Folder deleted',
            timer: 1500,
            showConfirmButton: false
          });

          this.loadFolders();

          this.loadDocuments();

        },

        error: (error) => {

          console.error(
            'Delete folder error:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'Unable to delete folder',
            text:
              error?.error?.error ||
              'Please try again.'
          });

        }

      });

  });

}

openFolder(folder: DocumentFolder): void {

  // Ya no estamos viendo "All Documents"
  this.showAllDocuments = false;

  if (this.currentFolder) {
    this.folderStack.push(this.currentFolder);
  }

  this.currentFolder = folder;

  this.selectedFolderId =
    folder.id_folder;

}
goBackFolder(): void {

  this.showAllDocuments = false;

  const previousFolder =
    this.folderStack.pop();

  if (!previousFolder) {

    this.currentFolder = null;

    this.selectedFolderId = null;

    // Al volver al nivel raíz mostramos
    // todos los documentos
    this.showAllDocuments = true;

    return;

  }

  this.currentFolder =
    previousFolder;

  this.selectedFolderId =
    previousFolder.id_folder;

}
openUnfiled(): void {

  this.showAllDocuments = false;

  this.selectedFolderId = -1;

  this.currentFolder = null;

  this.folderStack = [];

}
goToRoot(): void {

  // Mostrar todos los documentos
  this.showAllDocuments = true;

  // Salir de cualquier carpeta
  this.currentFolder = null;

  // Limpiar navegación
  this.folderStack = [];

  // Limpiar selección
  this.selectedFolderId = null;

}
get currentSubfolders(): DocumentFolder[] {

  const parentId =
    this.currentFolder
      ? this.currentFolder.id_folder
      : null;

  return this.folders.filter(folder => {

    const folderParent =
      folder.parent_id ?? null;

    return (
      folderParent === parentId &&
      folder.is_active !== false
    );

  });

}

}
