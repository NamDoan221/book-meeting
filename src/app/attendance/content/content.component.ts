import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'bm-meeting-schedule-content',
  templateUrl: './content.component.html'
})
export class BmMeetingAttendanceContentComponent implements OnInit {

  meetingScheduleForm: FormGroup;
  listMeetingSchedule: any[];
  listPosition: any[];
  loading: boolean;
  listPersonnel: any[];
  listMemberSelected: any[];
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  columnConfig: string[];
  modeEdit: boolean;
  meetingSchedule: any;
  modeStartCam: boolean;

  @Output() saveSuccess = new EventEmitter<any>();
  @Output() startAttendance = new EventEmitter<any>();
  @Output() stopAttendance = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder
  ) {
    this.modeStartCam = false;
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.listMemberSelected = [];
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
    this.columnConfig = [
      'Tên nhân viên',
      'Trạng thái điểm danh',
    ];
  }

  ngOnInit(): void {
    this.getData();
    this.initData();
  }

  initData() {
    this.meetingScheduleForm = this.fb.group({
      meeting_schedule: ['', [Validators.required]]
    });
  }

  getData() {
    const data = [];
    const data2 = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Lịch ${i}`,
        id: `Lịch ${i}`
      });
      data2.push({
        name: `Nv ${i}`,
        id: `Nv ${i}`,
        status: false
      })
    }
    this.listMeetingSchedule = data;
    this.listPersonnel = data2;
  }

  handlerScrollBottom(event: any) {

  }

  handlerChangeMember(event) {
    this.listMemberSelected = event;
  }

  handlerUpdate(event: Event) {
    event.stopPropagation();
    if (!this.meetingScheduleForm.valid) {
      Object.values(this.meetingScheduleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    console.log(this.meetingScheduleForm.value);

    this.saveSuccess.emit(this.meetingScheduleForm.value);
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params) {
      return;
    }
    this.pageIndexGroup = params.pageIndex;
    this.pageSize = params.pageSize;
    let param = {
      page: this.pageIndexGroup,
      limit: this.pageSize
    }
    // this.getListMeetingRoom(param);
  }

  handlerStart(event: Event) {
    event.stopPropagation();
    if (!this.modeStartCam) {
      if (!this.meetingScheduleForm.valid) {
        Object.values(this.meetingScheduleForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }
      this.startAttendance.emit();
      this.modeStartCam = !this.modeStartCam;
      return;
    }
    this.modeStartCam = !this.modeStartCam;
    this.stopAttendance.emit();
  }

}
