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
import { BmMeetingRoomComponent } from './meeting-room.component';
import { BmMeetingRoomAddEditComponent } from './add-edit/add-edit.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

export const routes: Routes = [
  {
    path: '',
    component: BmMeetingRoomComponent
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
    NzToolTipModule
  ],
  declarations: [
    BmMeetingRoomComponent,
    BmMeetingRoomAddEditComponent
  ]
})
export class BmMeetingRoomModule { }
