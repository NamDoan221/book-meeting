import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmLoginComponent } from './login.component';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { RouterModule, Routes } from '@angular/router';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

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
