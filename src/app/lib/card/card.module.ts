import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmLibCardComponent } from './card.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [BmLibCardComponent],
  exports: [BmLibCardComponent]
})
export class BmLibCardModule { }
