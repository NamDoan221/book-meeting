import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { differenceInCalendarDays } from 'date-fns';
import * as dayjs from 'dayjs';
import { DisabledTimeFn, NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { IParamsGetListMeetingRoom, IMeetingRoom } from 'src/app/lib/services/meeting-room/interfaces/room.interface';
import { MeetingRoomService } from 'src/app/lib/services/meeting-room/meeting-room.service';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meting-schedule.service';

@Component({
  selector: 'bm-meeting-schedule-add_edit',
  templateUrl: './add-edit.component.html'
})
export class BmMeetingScheduleAddEditComponent implements OnInit {

  meetingScheduleForm: FormGroup;
  listPosition: any[];
  loading: boolean;
  listPersonnel: any[];
  listMemberSelected: any[];

  totalMeetingRoom: number;
  listMeetingRoom: IMeetingRoom[];
  onSearchMeetingRoom: Subject<string> = new Subject();
  paramsGetMeetingRoom: IParamsGetListMeetingRoom;
  loadingMeetingRoom: boolean;
  firstCallMeetingRoom: boolean;

  pageSize: number;
  total: number;
  pageIndexGroup: number;
  today = new Date();

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, this.today) < 0;

  disabledDateTime: DisabledTimeFn = (current: Date) => {
    const currentCompareToday = differenceInCalendarDays(current, this.today) > 0;
    const currentHours = current?.getHours();
    const currentMinutes = current?.getMinutes();
    let numberDisableHours = 0;
    let numberDisableMinutes = 0;
    if (!currentCompareToday) {
      const minutes = this.today.getMinutes() + 15;
      const hours = this.today.getHours();
      if (currentHours && currentHours > hours) {
        numberDisableHours = hours;
        if (minutes > 59) {
          numberDisableHours = hours + 1;
          numberDisableMinutes = minutes - 59;
        }
      } else if (minutes <= 59) {
        numberDisableHours = hours;
        numberDisableMinutes = minutes;
      } else {
        numberDisableHours = hours + 1;
      }
    }
    return {
      nzDisabledHours: () => this.range(0, numberDisableHours),
      nzDisabledMinutes: () => this.range(0, numberDisableMinutes),
      nzDisabledSeconds: () => []
    }
  };

  @Input() meetingSchedule: any;
  @Input() modeEdit: boolean;

  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();

  constructor(
    private fb: FormBuilder,
    private meetingRoomService: MeetingRoomService,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService,
    private authService: AuthService
  ) {
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.listMemberSelected = [];
    this.loading = false;

    this.listMeetingRoom = [];
    this.paramsGetMeetingRoom = {
      page: 1,
      pageSize: 20
    }
    this.loadingMeetingRoom = true;
    this.firstCallMeetingRoom = true;
  }

  ngOnInit(): void {
    this.initData();
    this.onSearchMeetingRoom.pipe(debounceTime(500), filter(value => value !== this.paramsGetMeetingRoom.search)).subscribe((value) => {
      this.searchMeetingRoom(value);
    });
    this.getListMeetingRoom();
  }

  initData() {
    this.meetingScheduleForm = this.fb.group({
      Title: [this.meetingSchedule?.Title || '', [Validators.required]],
      Code: [this.meetingSchedule?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      EstStartTime: [this.meetingSchedule?.EstStartTime ? new Date(this.meetingSchedule?.EstStartTime) : null, [Validators.required]],
      EstDuration: [this.meetingSchedule?.EstDuration ? this.meetingSchedule?.EstDuration : '', [Validators.required]],
      IdRoom: [this.meetingSchedule?.IdRoom || '', [Validators.required]],
      Content: [this.meetingSchedule?.Content || '']
    });
  }

  handlerSearchMeetingRoom(event: string) {
    this.paramsGetMeetingRoom.page = 1;
    this.onSearchMeetingRoom.next(event);
  }

  handlerScrollBottomMeetingRoom() {
    if (this.loadingMeetingRoom || !this.totalMeetingRoom || this.totalMeetingRoom <= this.listMeetingRoom.length) {
      return;
    }
    this.paramsGetMeetingRoom.page += 1;
    this.getListMeetingRoom();
  }

  searchMeetingRoom(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetMeetingRoom.search : (this.paramsGetMeetingRoom.search = text);
    this.listMeetingRoom = [];
    this.getListMeetingRoom();
  }

  async getListMeetingRoom() {
    if (this.loadingMeetingRoom && !this.firstCallMeetingRoom) {
      return;
    }
    this.firstCallMeetingRoom = false;
    try {
      this.loadingMeetingRoom = true;
      const result = await this.meetingRoomService.getListMeetingRoom(this.paramsGetMeetingRoom);
      this.totalMeetingRoom = result.Total;
      this.listMeetingRoom.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingMeetingRoom = false;
    }
  }

  handlerScrollBottom(event) {

  }

  handlerChangeMember(event) {
    this.listMemberSelected = event;
  }

  async handlerUpdate(event: Event) {
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
    this.loading = true;
    const body = {
      ...this.meetingScheduleForm.value,
      IdCreator: this.authService.decodeToken().Id,
      EstEndTime: dayjs('2022-10-29T18:33:32.917Z'),
      // Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.meetingSchedule.Id;
    }
    try {
      const result = await this.meetingScheduleService[this.modeEdit ? 'updateMeetingSchedule' : 'createMeetingSchedule'](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.meetingSchedule.Id });
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }

    this.saveSuccess.emit(this.meetingScheduleForm.value);
  }

}
