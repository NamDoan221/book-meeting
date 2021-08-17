import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HnAccountComponent } from './account.component';
import { HnAccountRoutingModule } from './account.routing';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { IconsProviderModule } from '../shared/icon-ant/icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from '../shared/card/card.module';

@NgModule({
  imports: [
    CommonModule,
    HnAccountRoutingModule,
    NzInputModule,
    NzUploadModule,
    NzModalModule,
    NzButtonModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule
  ],
  declarations: [HnAccountComponent]
})
export class HnAccountModule { }
