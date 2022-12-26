import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { BmLoginComponent } from './login.component';

const routes: Routes = [
  {
    path: '',
    component: BmLoginComponent
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
    NzCheckboxModule
  ],
  declarations: [BmLoginComponent]
})
export class BmLoginModule { }
