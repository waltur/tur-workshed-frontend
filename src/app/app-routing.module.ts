import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './modules/auth/guards/auth.guard';



const routes: Routes = [
  { path: 'dashboard', canActivate: [AuthGuard], loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)},
  { path: 'login',  loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: '', component: HomeComponent,  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'volunteers',canActivate: [AuthGuard], loadChildren: () => import('./modules/volunteers/volunteers.module').then(m => m.VolunteersModule)},
  { path: 'contacts',   loadChildren: () => import('./modules/contacts/contacts.module').then(m => m.ContactsModule)},
  { path: 'admin',canActivate: [AuthGuard], loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
  { path: 'groups', loadChildren: () => import('./modules/groups/groups.module').then(m => m.GroupsModule) },

  { path: '**', redirectTo: '' }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

     }
