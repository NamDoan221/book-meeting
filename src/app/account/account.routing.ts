import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BmAccountComponent } from './account.component';

export const routes: Routes = [
  {
    path: '',
    component: BmAccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BmAccountRoutingModule {
}
