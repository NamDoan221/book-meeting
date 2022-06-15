import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmLayoutComponent } from './layout.component';
import { BmLayoutRoutingModule } from './layout.routing';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@NgModule({
  imports: [
    CommonModule,
    BmLayoutRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
  ],
  declarations: [BmLayoutComponent]
})
export class BmLayoutModule { }
