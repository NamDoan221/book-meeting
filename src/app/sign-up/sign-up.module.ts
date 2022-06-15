import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmSignUpComponent } from './sign-up.component';
import { BmSignUpRoutingModule } from './sign-up.routing';
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
    BmSignUpRoutingModule,
    IconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule
  ],
  declarations: [BmSignUpComponent]
})
export class BmSignUpModule { }
