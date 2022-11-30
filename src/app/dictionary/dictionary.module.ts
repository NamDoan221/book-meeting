import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { BmDictionaryAddEditComponent } from './add-edit/add-edit.component';
import { BmDictionaryDetailComponent } from './detail/detail.component';
import { BmDictionaryComponent } from './dictionary.component';

export const routes: Routes = [
  {
    path: '',
    component: BmDictionaryComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    NzDrawerModule,
    NzNotificationModule,
    NzFormModule,
    NzToolTipModule,
    NzSwitchModule,
    NzSpinModule,
    NzPopconfirmModule
  ],
  declarations: [
    BmDictionaryComponent,
    BmDictionaryAddEditComponent,
    BmDictionaryDetailComponent
  ]
})
export class BmDictionaryModule { }
