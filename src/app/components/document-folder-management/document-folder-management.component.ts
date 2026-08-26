
import {
  Component,
  OnInit
} from '@angular/core';

import Swal from 'sweetalert2';

import {
  DocumentFolder,
  DocumentFolderService
} from '../../services/document-folder.service';


@Component({
  selector: 'app-document-folder-management',
  templateUrl: './document-folder-management.component.html',
  styleUrls: ['./document-folder-management.component.css']
})
export class DocumentFolderManagementComponent
  implements OnInit {

  folders: DocumentFolder[] = [];

  loading = false;

  saving = false;

  showCreateForm = false;

  showEditForm = false;

  editingFolder:
    DocumentFolder | null = null;


  form = {

    name: '',

    description: '',

    parent_id: null as number | null

  };


  constructor(

    private folderService:
      DocumentFolderService

  ) {}


  ngOnInit(): void {

    this.loadFolders();

  }


  // =====================================================
  // LOAD FOLDERS
  // =====================================================

  loadFolders(): void {

    this.loading = true;

    this.folderService
      .getAllFolders()
      .subscribe({

        next: (response) => {

          this.folders =
            response.folders || [];

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading folders:',
            error
          );

          this.loading = false;

          Swal.fire({

            icon: 'error',

            title:
              'Unable to load folders',

            text:
              'Please try again later.'

          });

        }

      });

  }


  // =====================================================
  // OPEN CREATE
  // =====================================================

  openCreate(): void {

    this.resetForm();

    this.showCreateForm = true;

  }


  // =====================================================
  // CLOSE CREATE
  // =====================================================

  closeCreate(): void {

    if (this.saving) {
      return;
    }

    this.showCreateForm = false;

    this.resetForm();

  }


  // =====================================================
  // CREATE
  // =====================================================

  createFolder(): void {

    if (!this.form.name.trim()) {

      Swal.fire({

        icon: 'warning',

        title:
          'Folder name required'

      });

      return;

    }


    this.saving = true;

    this.folderService
      .createFolder({
        name:
          this.form.name.trim(),

        description:
          this.form.description.trim(),

        parent_id:
          this.form.parent_id
      })
      .subscribe({

        next: () => {

          this.saving = false;

          this.showCreateForm = false;

          this.resetForm();

          Swal.fire({

            icon: 'success',

            title:
              'Folder created',

            text:
              'The folder has been created successfully.',

            confirmButtonColor:
              '#f97316'

          });

          this.loadFolders();

        },

        error: (error) => {

          console.error(
            'Error creating folder:',
            error
          );

          this.saving = false;

          Swal.fire({

            icon: 'error',

            title:
              'Unable to create folder',

            text:
              error?.error?.error ||
              'Please try again.'

          });

        }

      });

  }


  // =====================================================
  // OPEN EDIT
  // =====================================================

  openEdit(
    folder: DocumentFolder
  ): void {

    this.editingFolder = folder;

    this.form = {

      name:
        folder.name,

      description:
        folder.description || '',

      parent_id:
        folder.parent_id || null

    };

    this.showEditForm = true;

  }


  // =====================================================
  // CLOSE EDIT
  // =====================================================

  closeEdit(): void {

    if (this.saving) {
      return;
    }

    this.showEditForm = false;

    this.editingFolder = null;

    this.resetForm();

  }


  // =====================================================
  // UPDATE
  // =====================================================

  updateFolder(): void {

    if (!this.editingFolder) {
      return;
    }


    if (!this.form.name.trim()) {

      Swal.fire({

        icon: 'warning',

        title:
          'Folder name required'

      });

      return;

    }


    this.saving = true;

    this.folderService
      .updateFolder(

        this.editingFolder.id_folder,

        {

          name:
            this.form.name.trim(),

          description:
            this.form.description.trim(),

          parent_id:
            this.form.parent_id

        }

      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.showEditForm = false;

          this.editingFolder = null;

          Swal.fire({

            icon: 'success',

            title:
              'Folder updated',

            confirmButtonColor:
              '#f97316'

          });

          this.loadFolders();

        },

        error: (error) => {

          console.error(
            'Error updating folder:',
            error
          );

          this.saving = false;

          Swal.fire({

            icon: 'error',

            title:
              'Unable to update folder',

            text:
              error?.error?.error ||
              'Please try again.'

          });

        }

      });

  }


  // =====================================================
  // STATUS
  // =====================================================

  toggleStatus(
    folder: DocumentFolder
  ): void {

    const newStatus =
      !folder.is_active;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';


    Swal.fire({

      icon: 'question',

      title:
        `${this.capitalize(action)} folder?`,

      text:
        newStatus
          ? 'The folder will become active.'
          : 'The folder will be deactivated.',

      showCancelButton: true,

      confirmButtonText:
        `Yes, ${action}`,

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        newStatus
          ? '#16a34a'
          : '#dc2626'

    })
      .then(result => {

        if (!result.isConfirmed) {
          return;
        }


        this.folderService
          .updateFolderStatus(

            folder.id_folder,

            newStatus

          )
          .subscribe({

            next: () => {

              folder.is_active =
                newStatus;

              Swal.fire({

                icon: 'success',

                title:
                  newStatus
                    ? 'Folder activated'
                    : 'Folder deactivated',

                timer: 1500,

                showConfirmButton:
                  false

              });

            },

            error: (error) => {

              console.error(
                'Error updating folder status:',
                error
              );

              Swal.fire({

                icon: 'error',

                title:
                  'Operation failed'

              });

            }

          });

      });

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteFolder(
    folder: DocumentFolder
  ): void {

    Swal.fire({

      icon: 'warning',

      title:
        'Delete folder?',

      text:
        `"${folder.name}" will be permanently deleted.`,

      showCancelButton: true,

      confirmButtonText:
        'Yes, delete',

      cancelButtonText:
        'Cancel',

      confirmButtonColor:
        '#dc2626'

    })
      .then(result => {

        if (!result.isConfirmed) {
          return;
        }


        this.folderService
          .deleteFolder(
            folder.id_folder
          )
          .subscribe({

            next: () => {

              Swal.fire({

                icon: 'success',

                title:
                  'Folder deleted',

                timer: 1500,

                showConfirmButton:
                  false

              });

              this.loadFolders();

            },

            error: (error) => {

              console.error(
                'Error deleting folder:',
                error
              );

              Swal.fire({

                icon: 'error',

                title:
                  'Unable to delete folder',

                text:
                  error?.error?.error ||
                  'The folder could not be deleted.'

              });

            }

          });

      });

  }


  // =====================================================
  // RESET
  // =====================================================

  resetForm(): void {

    this.form = {

      name: '',

      description: '',

      parent_id: null

    };

  }


  // =====================================================
  // HELPERS
  // =====================================================

  capitalize(
    value: string
  ): string {

    return (
      value.charAt(0).toUpperCase()
      + value.slice(1)
    );

  }


  getParentFolders(): DocumentFolder[] {

    return this.folders.filter(
      folder =>
        !folder.parent_id &&
        folder.is_active
    );

  }

}
