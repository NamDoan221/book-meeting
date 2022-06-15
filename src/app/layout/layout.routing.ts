import { BmLayoutComponent } from './layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: BmLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'chat' },
      {
        path: 'chat',
        loadChildren: () =>
          import('../chat/chat.module').then((m) => m.HnChatModule),
      },
      {
        path: 'social',
        loadChildren: () =>
          import('../social/social.module').then((m) => m.HnSocialModule),
      },
      {
        path: 'account',
        loadChildren: () =>
          import('../account/account.module').then((m) => m.HnAccountModule),
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BmLayoutRoutingModule { }
