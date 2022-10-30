import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { BmLayoutComponent } from './layout.component';
import { BmLayoutRoutingModule } from './layout.routing';

@NgModule({
  imports: [
    CommonModule,
    BmLayoutRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzBadgeModule,
    NzToolTipModule
  ],
  declarations: [
    BmLayoutComponent
  ]
})
export class BmLayoutModule { }
