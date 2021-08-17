import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HnSignUpComponent } from './sign-up.component';

const routes: Routes = [
  {
    path: '',
    component: HnSignUpComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HnSignUpRoutingModule {}
