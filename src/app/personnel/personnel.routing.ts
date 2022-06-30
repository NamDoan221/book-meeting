import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BmPersonnelComponent } from './personnel.component';

export const routes: Routes = [
  {
    path: '',
    component: BmPersonnelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BmPersonnelRoutingModule {
}
