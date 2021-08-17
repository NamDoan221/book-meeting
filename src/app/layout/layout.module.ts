import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HnLayoutComponent } from './layout.component';
import { HnLayoutRoutingModule } from './layout.routing';
import { IconsProviderModule } from '../shared/icon-ant/icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@NgModule({
  imports: [
    CommonModule,
    HnLayoutRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
  ],
  declarations: [HnLayoutComponent]
})
export class HnLayoutModule { }
