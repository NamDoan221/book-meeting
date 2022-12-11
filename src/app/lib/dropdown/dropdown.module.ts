import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmLibDropDownComponent } from './dropdown.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule
  ],
  declarations: [BmLibDropDownComponent],
  exports: [BmLibDropDownComponent]
})
export class BmLibDropDownModule { }
