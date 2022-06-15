import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmLoginComponent } from './login.component';
import { BmLoginRoutingModule } from './login.routing';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BmLoginRoutingModule,
    IconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule
  ],
  declarations: [BmLoginComponent]
})
export class BmLoginModule { }
