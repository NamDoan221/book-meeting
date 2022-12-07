import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BmLibCardModule } from '../lib/card/card.module';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { BmMeetingScheduleComponent } from './meeting-schedule.component';
import { BmMeetingScheduleAddEditComponent } from './add-edit/add-edit.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { CheckTimeStartMeetingSchedulePipeModule } from './pipes/check-time-start.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BmMeetingScheduleAddPersonnelComponent } from './add-personnel/add-personnel.component';
import { CheckStatusMeetingSchedulePipeModule } from './pipes/check-status.pipe';
import { CheckPersonnelJoinMeetingSchedulePipeModule } from './pipes/check-personnel-join.pipe';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { BmMeetingScheduleAttendanceComponent } from './attendance/attendance.component';
import { BmMeetingScheduleDynamicFieldComponent } from './dynamic-field/dynamic-field.component';
import { CheckCanAttendanceMeetingSchedulePipeModule } from './pipes/check-can-attendance.pipe';
import { GetIgnorePersonnelPipeModule } from './pipes/get-ignore-personnel.pipe';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

export const routes: Routes = [
  {
    path: '',
    component: BmMeetingScheduleComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzTableModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    BmLibCardModule,
    NzDrawerModule,
    NzNotificationModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzToolTipModule,
    NzDatePickerModule,
    NzTagModule,
    NzSpinModule,
    NzSwitchModule,
    CheckTimeStartMeetingSchedulePipeModule,
    CheckStatusMeetingSchedulePipeModule,
    CheckPersonnelJoinMeetingSchedulePipeModule,
    NzSegmentedModule,
    NzCheckboxModule,
    CheckCanAttendanceMeetingSchedulePipeModule,
    GetIgnorePersonnelPipeModule
  ],
  declarations: [
    BmMeetingScheduleComponent,
    BmMeetingScheduleAddEditComponent,
    BmMeetingScheduleAddPersonnelComponent,
    BmMeetingScheduleAttendanceComponent,
    BmMeetingScheduleDynamicFieldComponent
  ]
})
export class BmMeetingScheduleModule { }
