import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BmLoginComponent } from './login.component';

const routes: Routes = [
  {
    path: '',
    component: BmLoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BmLoginRoutingModule { }
