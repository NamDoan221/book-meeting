import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'bm-department-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BmDepartmentAddEditComponent implements OnInit {

  departmentForm: FormGroup;
  listMember: any[];
  loading: boolean;
  listMemberSelected: any[];

  @Input() department: any;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder
  ) {
    this.loading = false;
    this.listMemberSelected = [];
  }

  ngOnInit(): void {
    this.getListMemberByDepartmentId();
    this.initData();
  }

  initData() {
    this.listMemberSelected = this.department?.member || [];
    this.departmentForm = this.fb.group({
      name: [this.department?.name || '', [Validators.required]],
      manager: [this.department?.manager || '', [Validators.required]],
      description: [this.department?.description || ''],
      member: [this.department?.member || [], [Validators.required]]
    });
  }

  getListMemberByDepartmentId() {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Nguyễn Văn A ${i}`,
        regency: `Nhân viên ${i}`
      });
    }
    this.listMember = data;
  }

  handlerScrollBottom(event: any) {

  }

  handlerChangeMember(event) {
    this.listMemberSelected = event;
  }

  handlerUpdate(event: Event) {
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
    this.saveSuccess.emit(this.departmentForm.value);
  }

}
