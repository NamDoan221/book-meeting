import { BmLayoutComponent } from './layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: BmLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'account' },
      {
        path: 'personnel',
        loadChildren: () =>
          import('../personnel/personnel.module').then((m) => m.BmPersonnelModule),
      },
      {
        path: 'department',
        loadChildren: () =>
          import('../department/department.module').then((m) => m.BmDepartmentModule),
      },
      {
        path: 'meeting-room',
        loadChildren: () =>
          import('../meeting-room/meeting-room.module').then((m) => m.BmMeetingRoomModule),
      },
      // {
      //   path: 'meeting-schedule',
      //   loadChildren: () =>
      //     import('../department/department.module').then((m) => m.HnSocialModule),
      // },
      {
        path: 'account',
        loadChildren: () =>
          import('../account/account.module').then((m) => m.BmAccountModule),
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BmLayoutRoutingModule { }
