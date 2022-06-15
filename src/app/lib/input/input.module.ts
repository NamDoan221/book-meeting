import { TranslateModule } from '@ngx-translate/core';
import { LabelModule } from '../label/label.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input.component';
import { NumberPipePipe } from './pipe/number-pipe.pipe';

@NgModule({
  imports: [
    CommonModule,
    LabelModule,
    TranslateModule
  ],
  declarations: [InputComponent,
    NumberPipePipe
  ],
  exports: [InputComponent]
})
export class InputModule { }
