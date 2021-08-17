import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HnAccountComponent } from './account.component';

export const routes: Routes = [
  {
    path: '',
    component: HnAccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HnAccountRoutingModule {
}
