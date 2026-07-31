import { Component, OnInit } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalog-management',
  templateUrl: './catalog-management.component.html',
  styleUrls: ['./catalog-management.component.css']
})
export class CatalogManagementComponent implements OnInit {

  catalogs = [

    {
      key:'skills',
      title:'Volunteer Skills'
    },

    {
      key:'interests',
      title:'Volunteer Interests'
    },

    {
      key:'certifications',
      title:'Volunteer Certifications'
    },

    {
      key:'availability',
      title:'Availability'
    },

    {
      key:'functions',
      title:'Volunteer Functions'
    }

  ];

  selectedCatalog='skills';

  items:any[]=[];

  filteredItems:any[]=[];

  search='';
  catalogForm!:FormGroup;

  editing=false;

  editingId:number|null=null;

  showModal = false;


  constructor(
      private catalogService:CatalogService,  private fb:FormBuilder
  ){}

  ngOnInit():void{

      this.catalogForm=this.fb.group({

          name:['',Validators.required],

          description:[''],

          active:[true]

      });
      this.loadCatalog();

  }

openNew() {

  this.editing = false;

  this.editingId = null;

  this.catalogForm.reset({

    active: true

  });

  this.showModal = true;

}

openEdit(item:any){

  this.editing = true;

  this.editingId = item.id;

  this.catalogForm.patchValue({

      name:item.name,

      description:item.description,

      active:item.active

  });

  this.showModal = true;

}

closeModal(){

    this.showModal=false;

}

  selectCatalog(cat:any){

      this.selectedCatalog=cat.key;

      this.search='';

      this.loadCatalog();

  }

  loadCatalog(){

      this.catalogService
          .getCatalog(this.selectedCatalog)
          .subscribe(data=>{

              this.items=data;

              this.filteredItems=data;

          });

  }

  filter(){

      const value=this.search.toLowerCase();

      this.filteredItems=this.items.filter((x:any)=>{

          return JSON.stringify(x)
              .toLowerCase()
              .includes(value);

      });

  }
  saveCatalog() {

    if (this.catalogForm.invalid) {

      this.catalogForm.markAllAsTouched();

      return;

    }

    const data = this.catalogForm.value;

    if (!this.editing) {

      this.catalogService.create(this.selectedCatalog, data).subscribe({

        next: () => {

          Swal.fire({

            icon: 'success',

            title: 'Created',

            text: 'Catalog item created successfully.',

            timer: 1500,

            showConfirmButton: false

          });

          this.closeModal();

          this.loadCatalog();

        },

        error: () => {

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'Unable to create item.'

          });

        }

      });

    }

    else {

      this.catalogService.update(

        this.selectedCatalog,

        this.editingId!,

        data

      ).subscribe({

        next: () => {

          Swal.fire({

            icon: 'success',

            title: 'Updated',

            text: 'Catalog item updated successfully.',

            timer: 1500,

            showConfirmButton: false

          });

          this.closeModal();

          this.loadCatalog();

        },

        error: () => {

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'Unable to update item.'

          });

        }

      });

    }

  }
deleteItem(item:any){

    Swal.fire({

        title:'Delete item?',

        text:`"${item.name}" will be removed.`,

        icon:'warning',

        showCancelButton:true,

        confirmButtonText:'Delete',

        confirmButtonColor:'#d33'

    }).then(result=>{

        if(!result.isConfirmed){

            return;

        }

        this.catalogService.delete(

            this.selectedCatalog,

            item.id

        ).subscribe({

            next:()=>{

                Swal.fire({

                    icon:'success',

                    title:'Deleted',

                    timer:1200,

                    showConfirmButton:false

                });

                this.loadCatalog();

            },

            error:()=>{

                Swal.fire({

                    icon:'error',

                    title:'Error',

                    text:'Unable to delete.'

                });

            }

        });

    });

}
}
