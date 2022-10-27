import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BmNotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.BmLoginModule)
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./sign-up/sign-up.module').then((m) => m.BmSignUpModule)
  },
  {
    path: '',
    loadChildren: () =>
      import('./layout/layout.module').then((m) => m.BmLayoutModule)
  },
  {
    path: '**',
    component: BmNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
