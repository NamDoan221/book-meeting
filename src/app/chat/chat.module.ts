import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HnChatComponent } from './chat.component';
import { HnChatRoutingModule } from './chat.routing';
import { FormsModule } from '@angular/forms';
import { HnChatService } from './services/chat.service';
import { TranslateModule } from '@ngx-translate/core';
import { IconsProviderModule } from '../lib/icon-ant/icons-provider.module';
import { HnClickOutsideDirective } from '../lib/directives/click-outside.directive';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { HnContactsModule } from './contacts/contacts.module';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    HnChatRoutingModule,
    IconsProviderModule,
    NzResultModule,
    NzButtonModule,
    HnContactsModule,
    PerfectScrollbarModule
  ],
  declarations: [
    HnChatComponent,
    HnClickOutsideDirective
  ],
  providers: [
    HnChatService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }]
})
export class HnChatModule { }
