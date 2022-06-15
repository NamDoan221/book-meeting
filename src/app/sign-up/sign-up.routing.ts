import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BmSignUpComponent } from './sign-up.component';

const routes: Routes = [
  {
    path: '',
    component: BmSignUpComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BmSignUpRoutingModule { }
