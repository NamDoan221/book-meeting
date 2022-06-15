import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from '../lib/card/card.module';
import { HnSocialComponent } from './social.component';
import { HnSocialRoutingModule } from './social.routing';
import { HnChatService } from '../chat/services/chat.service';

@NgModule({
  imports: [
    CommonModule,
    NzInputModule,
    NzUploadModule,
    NzModalModule,
    NzButtonModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    HnSocialRoutingModule
  ],
  declarations: [HnSocialComponent],
  providers: [HnChatService]
})
export class HnSocialModule { }
