import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'bm-meeting-schedule-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BmMeetingScheduleAddEditComponent implements OnInit {

  meetingScheduleForm: FormGroup;
  listMeetingRoom: any[];
  listPosition: any[];
  loading: boolean;
  listPersonnel: any[];
  listMemberSelected: any[];

  pageSize: number;
  total: number;
  pageIndexGroup: number;

  @Input() meetingSchedule: any;
  @Input() modeEdit: boolean;

  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;

  @Output() saveSuccess = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder
  ) {
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
  }

  ngOnInit(): void {
    this.getData();
    this.initData();
  }

  initData() {
    this.meetingScheduleForm = this.fb.group({
      name: [this.meetingSchedule?.name || '', [Validators.required]],
      start_time: [this.meetingSchedule?.start_time ? new Date(this.meetingSchedule?.start_time) : null, [Validators.required]],
      estimated_duration: [this.meetingSchedule?.estimated_duration ? this.meetingSchedule?.estimated_duration : '', [Validators.required]],
      meeting_room: [this.meetingSchedule?.meeting_room || '', [Validators.required]],
      meeting_manager: [this.meetingSchedule?.meeting_manager || '', [Validators.required]],
      description: [this.meetingSchedule?.description || ''],
      participants: [this.meetingSchedule?.participants || [], [Validators.required]]
    });
  }

  getData() {
    const data = [];
    const data2 = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Room ${i}`,
        id: `Room ${i}`
      });
      data2.push({
        name: `Nv ${i}`,
        id: `Nv ${i}`
      })
    }
    this.listMeetingRoom = data;
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

}
