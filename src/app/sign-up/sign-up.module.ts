import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HnSignUpComponent } from './sign-up.component';
import { HnSignUpRoutingModule } from './sign-up.routing';
import { IconsProviderModule } from '../shared/icon-ant/icons-provider.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HnSignUpRoutingModule,
    IconsProviderModule,
    NzInputModule,
    NzButtonModule
  ],
  declarations: [HnSignUpComponent]
})
export class HnSignUpModule { }
