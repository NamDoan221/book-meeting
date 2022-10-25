import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { BmRoleComponent } from './role.component';

export const routes: Routes = [
  {
    path: '',
    component: BmRoleComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzInputModule,
    NzButtonModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    NzNotificationModule,
    NzFormModule,
    NzSelectModule,
    NzSpinModule,
    NzCheckboxModule
  ],
  declarations: [
    BmRoleComponent
  ]
})
export class BmRoleModule { }
