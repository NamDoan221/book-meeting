import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BmDepartmentComponent } from './department.component';

export const routes: Routes = [
  {
    path: '',
    component: BmDepartmentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BmDepartmentRoutingModule {
}
