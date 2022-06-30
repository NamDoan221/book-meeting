import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'bm-personnel-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BmPersonnelAddEditComponent implements OnInit {

  personnelForm: FormGroup;
  listDepartment: any[];
  listPosition: any[];
  loading: boolean;

  @Input() personnel: any;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder
  ) {
    this.loading = false;
    this.listPosition = [
      {
        name: 'Quản lý',
        key: 'manager'
      },
      {
        name: 'Nhân viên',
        key: 'member'
      },
      {
        name: 'Giám đốc',
        key: 'director'
      }
    ]
  }

  ngOnInit(): void {
    this.getListDepartment();
    this.initData();
  }

  initData() {
    this.personnelForm = this.fb.group({
      name: [this.personnel?.name || '', [Validators.required]],
      address: [this.personnel?.address || '', [Validators.required]],
      gender: [this.personnel?.gender || '', [Validators.required]],
      phone_number: [this.personnel?.phone_number || '', [Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(11)]],
      department: [this.personnel?.department || ''],
      position: [this.personnel?.position || '', [Validators.required]]
    });
  }

  getListDepartment() {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Nguyễn Văn A ${i}`,
        regency: `Nhân viên ${i}`
      });
    }
    this.listDepartment = data;
  }

  handlerScrollBottom(event: any) {

  }

  handlerUpdate(event: Event) {
    event.stopPropagation();
    if (!this.personnelForm.valid) {
      Object.values(this.personnelForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.saveSuccess.emit(this.personnelForm.value);
  }

}
