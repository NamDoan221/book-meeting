import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HnChatComponent } from './chat.component';

export const routes: Routes = [
  {
    path: '',
    component: HnChatComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HnChatRoutingModule {
}
