import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BmLayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: BmLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'account' },
      {
        path: 'personnel',
        loadChildren: () =>
          import('../personnel/personnel.module').then((m) => m.BmPersonnelModule)
      },
      {
        path: 'department',
        loadChildren: () =>
          import('../department/department.module').then((m) => m.BmDepartmentModule)
      },
      {
        path: 'meeting-room',
        loadChildren: () =>
          import('../meeting-room/meeting-room.module').then((m) => m.BmMeetingRoomModule)
      },
      {
        path: 'meeting-schedule',
        loadChildren: () =>
          import('../meeting-schedule/meeting-schedule.module').then((m) => m.BmMeetingScheduleModule)
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('../attendance/attendance.module').then((m) => m.BmMeetingAttendanceModule)
      },
      {
        path: 'account',
        loadChildren: () =>
          import('../account/account.module').then((m) => m.BmAccountModule)
      },
      {
        path: 'position',
        loadChildren: () =>
          import('../position/position.module').then((m) => m.BmPositionModule)
      },
      {
        path: 'function',
        loadChildren: () =>
          import('../function/function.module').then((m) => m.BmFunctionModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BmLayoutRoutingModule { }
