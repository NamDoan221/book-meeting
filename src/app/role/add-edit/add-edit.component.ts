import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { FunctionService } from 'src/app/lib/services/function/function.service';
import { IFunction } from 'src/app/lib/services/function/interfaces/function.interface';
import { IRoom } from 'src/app/lib/services/room/interfaces/room.interface';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'bm-function-add-edit',
  templateUrl: './add-edit.component.html'
})
export class BmFunctionAddEditComponent implements OnInit {

  functionForm: FormGroup;
  loading: boolean;

  @Input() parentId: string;
  @Input() function: IFunction;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IRoom>();

  constructor(
    private fb: FormBuilder,
    private functionService: FunctionService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.functionForm = this.fb.group({
      Name: [this.function?.Name || '', [Validators.required]],
      Url: [this.function?.Url || ''], // Validators.pattern('^\/+([a-zA-Z])+$')
      Description: [this.function?.Description || ''],
      IsMenu: [this.function?.IsMenu || true],
      Code: [this.function?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      Active: [this.function?.Active || true]
    });
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.functionForm.valid) {
      Object.values(this.functionForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.functionForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.function.Id;
    }
    if (this.parentId) {
      body.IdParent = this.parentId;
    }
    if (this.function?.IdParent) {
      body.IdParent = this.function.IdParent;
    }
    try {
      const result = await this.functionService[this.modeEdit ? 'updateFunction' : 'createFunction'](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.function.Id });
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }
  }

}
