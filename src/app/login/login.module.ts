import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HnLoginComponent } from './login.component';
import { HnLoginRoutingModule } from './login.routing';
import { IconsProviderModule } from '../shared/icon-ant/icons-provider.module';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HnLoginRoutingModule,
    IconsProviderModule,
    NzInputModule,
    NzButtonModule
  ],
  declarations: [HnLoginComponent]
})
export class HnLoginModule { }
