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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { BmLibCardModule } from '../lib/card/card.module';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { BmPositionAddEditComponent } from './add-edit/add-edit.component';
import { BmPositionComponent } from './position.component';

export const routes: Routes = [
  {
    path: '',
    component: BmPositionComponent
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
    NzToolTipModule,
    NzSwitchModule,
    NzSpinModule,
    NzTabsModule
  ],
  declarations: [
    BmPositionComponent,
    // BmPositionMemberComponent,
    BmPositionAddEditComponent
  ]
})
export class BmPositionModule { }
