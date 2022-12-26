import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { AttendanceTypeService } from 'src/app/lib/services/attendance-type/attendance-type.service';
import { IAttendanceType } from 'src/app/lib/services/attendance-type/interfaces/attendance-type.interface';
import { DepartmentService } from '../../lib/services/department/department.service';
import { IDepartment } from '../../lib/services/department/interfaces/department.interface';
import { DictionaryService } from '../../lib/services/dictionary/dictionary.service';
import { IDataItemGetByTypeDictionary } from '../../lib/services/dictionary/interfaces/dictionary.interface';

@Component({
  selector: 'bm-attendance_type-add_edit',
  templateUrl: './add-edit.component.html'
})
export class BmAttendanceTypeAddEditComponent implements OnInit {

  attendanceTypeForm: FormGroup;
  loading: boolean;

  @Input() attendanceType: IAttendanceType;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IAttendanceType>();

  constructor(
    private fb: FormBuilder,
    private attendanceTypeService: AttendanceTypeService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.attendanceTypeForm = this.fb.group({
      Name: [this.attendanceType?.Name || '', [Validators.required]],
      IsRequired: [this.attendanceType?.IsRequired || false, [Validators.required]],
      Description: [this.attendanceType?.Description || ''],
      Code: [this.attendanceType?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      Active: [this.attendanceType?.Active || true]
    });
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.attendanceTypeForm.valid) {
      Object.values(this.attendanceTypeForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.attendanceTypeForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.attendanceType.Id;
    }
    try {
      const result = await this.attendanceTypeService[this.modeEdit ? 'updateAttendanceType' : 'createAttendanceType'](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.attendanceType.Id });
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
