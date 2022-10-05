import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserCanActive } from './lib/services/auth.service';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '' },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.BmLoginModule),
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./sign-up/sign-up.module').then((m) => m.BmSignUpModule),
  },
  {
    path: '',
    canActivate: [UserCanActive],
    loadChildren: () =>
      import('./layout/layout.module').then((m) => m.BmLayoutModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
