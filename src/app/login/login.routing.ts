import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HnLoginComponent } from './login.component';

const routes: Routes = [
  { path: '',
   component: HnLoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HnLoginRoutingModule {}
