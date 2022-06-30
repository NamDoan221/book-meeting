import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BmLibCardModule } from '../lib/card/card.module';
import { BmDepartmentComponent } from './department.component';
import { BmDepartmentRoutingModule } from './department.routing';
import { BmDepartmentMemberComponent } from './member/member.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { BmDepartmentAddEditComponent } from './add-edit/add-edit.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@NgModule({
  imports: [
    CommonModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzTableModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    BmLibCardModule,
    BmDepartmentRoutingModule,
    NzDrawerModule,
    NzNotificationModule,
    NzFormModule,
    NzSelectModule,
    NzToolTipModule
  ],
  declarations: [
    BmDepartmentComponent,
    BmDepartmentMemberComponent,
    BmDepartmentAddEditComponent
  ]
})
export class BmDepartmentModule { }
