import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BmLibCardModule } from '../lib/card/card.module';
import { BmPersonnelComponent } from './personnel.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { BmPersonnelAddEditComponent } from './add-edit/add-edit.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { RouterModule, Routes } from '@angular/router';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

export const routes: Routes = [
  {
    path: '',
    component: BmPersonnelComponent
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
    NzRadioModule,
    NzTabsModule,
    NzSwitchModule,
    NzSpinModule,
    NzDatePickerModule
  ],
  declarations: [
    BmPersonnelComponent,
    BmPersonnelAddEditComponent
  ]
})
export class BmPersonnelModule { }
