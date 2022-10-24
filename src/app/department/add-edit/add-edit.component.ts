import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { DepartmentService } from '../../lib/services/department/department.service';
import { IDepartment } from '../../lib/services/department/interfaces/department.interface';
import { DictionaryService } from '../../lib/services/dictionary/dictionary.service';
import { IDataItemGetByTypeDictionary } from '../../lib/services/dictionary/interfaces/dictionary.interface';

@Component({
  selector: 'bm-department-add_edit',
  templateUrl: './add-edit.component.html'
})
export class BmDepartmentAddEditComponent implements OnInit {

  departmentForm: FormGroup;
  listDepartmentLevel: IDataItemGetByTypeDictionary[];
  loading: boolean;

  @Input() department: IDepartment;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IDepartment>();

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private nzMessageService: NzMessageService,
    private dictionaryService: DictionaryService
  ) {
    this.loading = false;
    this.listDepartmentLevel = [];
  }

  ngOnInit(): void {
    this.departmentForm = this.fb.group({
      Name: [this.department?.Name || '', [Validators.required]],
      IdLevel: [this.department?.IdLevel || null, [Validators.required]],
      Description: [this.department?.Description || ''],
      Code: [this.department?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      Active: [this.department?.Active || true]
    });
    this.getListDepartmentLevel();
  }

  async getListDepartmentLevel() {
    try {
      const result = await this.dictionaryService.getListDataByTypeDictionary('DEPARTMENT_LEVEL');
      this.listDepartmentLevel = result;
    } catch (error) {
      console.log(error);
    }
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.departmentForm.valid) {
      Object.values(this.departmentForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.departmentForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.department.Id;
    }
    try {
      const result = await this.departmentService[this.modeEdit ? 'updateDepartment' : 'createDepartment'](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.department.Id });
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
