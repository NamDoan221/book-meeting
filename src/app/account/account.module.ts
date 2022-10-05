import { NzImageModule } from 'ng-zorro-antd/image';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmAccountComponent } from './account.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BmLibCardModule } from '../lib/card/card.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    component: BmAccountComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzInputModule,
    NzUploadModule,
    NzModalModule,
    NzButtonModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    BmLibCardModule,
    NzImageModule,
    NzFormModule
  ],
  declarations: [BmAccountComponent]
})
export class BmAccountModule { }
