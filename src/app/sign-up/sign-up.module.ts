import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmSignUpComponent } from './sign-up.component';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { RouterModule, Routes } from '@angular/router';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';

const routes: Routes = [
  {
    path: '',
    component: BmSignUpComponent
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    IconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzDatePickerModule,
    NzRadioModule
  ],
  declarations: [BmSignUpComponent]
})
export class BmSignUpModule { }
