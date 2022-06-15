import { IconsProviderModule } from '../../lib/icon-ant/icons-provider.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HnContactsComponent } from './contacts.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@NgModule({
  imports: [
    CommonModule,
    NzInputModule,
    IconsProviderModule,
    NzAvatarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [HnContactsComponent],
  exports: [HnContactsComponent]
})
export class HnContactsModule { }
