import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tabs } from '../defines/data.define';

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
  listMeeting: any[];
  tabs: Array<any>;
  selectedTab: number;
  columnConfig: string[];

  pageSize: number;
  total: number;
  pageIndexGroup: number;

  @Input() personnel: any;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder
  ) {

    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;

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
    ];
    this.selectedTab = 0;
    this.tabs = Tabs();
    this.columnConfig = [
      'Tên cuộc họp',
      'Thời gian diễn ra',
      'Số người tham gia',
      'Mô tả cuộc họp'
    ];
  }

  ngOnInit(): void {
    this.getData();
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

  handlerTabChange(event) {
    this.selectedTab = event.index;
  }

  getData() {
    const data = [];
    const data2 = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Nguyễn Văn A ${i}`,
        regency: `Nhân viên ${i}`
      });
      data2.push({
        name: `Cuoc hop ${i}`,
        date_time: `20/7/2022`,
        total_participation: i + 1,
        description: `Noi dung cuoc hop ${i}`
      })
    }
    this.listDepartment = data;
    this.listMeeting = data2;
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
