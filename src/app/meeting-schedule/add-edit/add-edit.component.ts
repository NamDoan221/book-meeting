import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { differenceInCalendarDays } from 'date-fns';
import * as dayjs from 'dayjs';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from 'src/app/lib/services/department/interfaces/department.interface';
import { IMeetingRoom, IParamsGetListMeetingRoomFreeTime } from 'src/app/lib/services/meeting-room/interfaces/room.interface';
import { MeetingRoomService } from 'src/app/lib/services/meeting-room/meeting-room.service';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meting-schedule.service';
import { IParamsGetListPersonnelFreeTime, IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';
import { IParamsGetListPosition, IPosition } from 'src/app/lib/services/position/interfaces/position.interface';
import { PositionService } from 'src/app/lib/services/position/position.service';

@Component({
  selector: 'bm-meeting-schedule-add_edit',
  templateUrl: './add-edit.component.html'
})
export class BmMeetingScheduleAddEditComponent implements OnInit {

  meetingScheduleForm: FormGroup;
  loading: boolean;
  isDirty: boolean;

  totalMeetingRoom: number;
  listMeetingRoom: IMeetingRoom[];
  onSearchMeetingRoom: Subject<string> = new Subject();
  paramsGetMeetingRoom: IParamsGetListMeetingRoomFreeTime;
  loadingMeetingRoom: boolean;
  firstCallMeetingRoom: boolean;

  today = new Date();
  rangeChange: boolean;
  durationChange: boolean;

  listPersonnelJoin: IPersonnel[];
  totalPersonnel: number;
  listPersonnel: IPersonnel[];
  onSearchPersonnel: Subject<string> = new Subject();
  paramsGetPersonnel: IParamsGetListPersonnelFreeTime;
  loadingPersonnel: boolean;
  firstCallPersonnel: boolean;

  totalDepartment: number;
  listDepartment: IDepartment[];
  onSearchDepartment: Subject<string> = new Subject();
  paramsGetDepartment: IParamsGetListDepartment;
  firstCallDepartment: boolean;
  loadingDepartment: boolean;

  totalPosition: number;
  listPosition: IPosition[];
  onSearchPosition: Subject<string> = new Subject();
  paramsGetPosition: IParamsGetListPosition;
  loadingPosition: boolean;
  firstCallPosition: boolean;

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

  @Input() meetingSchedule: IMeetingSchedule;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();

  constructor(
    private fb: FormBuilder,
    private meetingRoomService: MeetingRoomService,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private personnelService: PersonnelService,
  ) {
    this.loading = false;
    this.isDirty = false;

    this.listMeetingRoom = [];
    this.paramsGetMeetingRoom = {
      page: 1,
      pageSize: 20,
      search: '',
      from: dayjs().utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      to: dayjs().add(5, 'day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      active: true
    }
    this.loadingMeetingRoom = true;
    this.firstCallMeetingRoom = true;
    this.rangeChange = false;
    this.durationChange = false;

    this.listPersonnelJoin = [];
    this.listPersonnel = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 20,
      from: dayjs().utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      to: dayjs().add(5, 'day').utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      search: ''
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;

    this.totalDepartment = 0;
    this.listDepartment = [];
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 20,
      active: true,
      search: ''
    };
    this.loadingDepartment = true;
    this.firstCallDepartment = true;

    this.totalPosition = 0;
    this.listPosition = [];
    this.loadingPosition = true;
    this.firstCallPosition = true;
    this.paramsGetPosition = {
      page: 1,
      pageSize: 20,
      search: ''
    }
  }

  ngOnInit(): void {
    this.initData();
    this.onSearchMeetingRoom.pipe(debounceTime(500), filter(value => value !== this.paramsGetMeetingRoom.search)).subscribe((value) => {
      this.searchMeetingRoom(value);
    });
    this.onSearchPosition.pipe(debounceTime(500), filter(value => value !== this.paramsGetPosition.search)).subscribe((value) => {
      this.searchPosition(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.onSearchPersonnel.pipe(debounceTime(500), filter(value => value !== this.paramsGetPersonnel.search)).subscribe((value) => {
      this.searchPersonnel(value);
    });
    this.getListMeetingRoom();
    this.getListDepartment();
    this.getListPosition();
    this.getListPersonnel();
  }

  initData() {
    this.meetingScheduleForm = this.fb.group({
      Title: [this.meetingSchedule?.Title || '', [Validators.required]],
      Code: [this.meetingSchedule?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      RangeTime: [this.meetingSchedule?.EstStartTime && this.meetingSchedule?.EstEndTime ? [new Date(this.meetingSchedule?.EstStartTime), new Date(this.meetingSchedule?.EstEndTime)] : [], [Validators.required]],
      EstDuration: [this.meetingSchedule?.EstDuration ? this.meetingSchedule?.EstDuration : '', [Validators.required]],
      IdRoom: [this.meetingSchedule?.IdRoom || '', [Validators.required]],
      MeetingScheduleDtls: [this.meetingSchedule?.MeetingScheduleDtls || [], [Validators.required]],
      Content: [this.meetingSchedule?.Content || '']
    });
    if (this.meetingSchedule?.EstStartTime) {
      this.paramsGetMeetingRoom.from = dayjs(this.meetingSchedule.EstStartTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
      this.paramsGetPersonnel.from = dayjs(this.meetingSchedule.EstStartTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
    }
    if (this.meetingSchedule?.EstEndTime) {
      this.paramsGetMeetingRoom.to = dayjs(this.meetingSchedule.EstEndTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
      this.paramsGetPersonnel.to = dayjs(this.meetingSchedule.EstEndTime).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
    }
  }

  rangeTimeChange(result: Date[]) {
    if (this.durationChange) {
      return;
    }
    this.rangeChange = true;
    setTimeout(() => {
      this.rangeChange = false;
    }, 250);
    const duration = dayjs(result[1]).utc().diff(dayjs(result[0]).utc(), 'minute', false);
    this.meetingScheduleForm.controls.EstDuration.setValue(duration);
    this.refreshMeetingRoomWhenChangeTime(result);
  }

  durationTimeChange(event: number) {
    if (this.rangeChange) {
      return;
    }
    this.durationChange = true;
    setTimeout(() => {
      this.durationChange = false;
    }, 250);
    if (this.meetingScheduleForm.controls.RangeTime.value.length) {
      const rangeTime = [dayjs(this.meetingScheduleForm.controls.RangeTime.value[0]).utc().toDate(), dayjs(this.meetingScheduleForm.controls.RangeTime.value[0]).add(event, 'minute').utc().toDate()];
      this.meetingScheduleForm.controls.RangeTime.setValue(rangeTime);
      this.refreshMeetingRoomWhenChangeTime(rangeTime);
      return;
    }
    const rangeTime = [dayjs().add(15, 'minute').utc().toDate(), dayjs().add(15 + event, 'minute').utc().toDate()];
    this.meetingScheduleForm.controls.RangeTime.setValue(rangeTime);
    this.refreshMeetingRoomWhenChangeTime(rangeTime);
  }

  refreshMeetingRoomWhenChangeTime(result: Date[]) {
    this.paramsGetMeetingRoom.from = dayjs(result[0]).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.paramsGetMeetingRoom.to = dayjs(result[1]).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    this.listMeetingRoom = [];
    this.getListMeetingRoom();
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
      const result = await this.meetingRoomService.getListMeetingRoomFreeTime(this.paramsGetMeetingRoom);
      this.totalMeetingRoom = result.Total;
      this.listMeetingRoom.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingMeetingRoom = false;
    }
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    this.isDirty = true;
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
    const body: IMeetingSchedule = {
      ...this.meetingScheduleForm.value,
      EstStartTime: dayjs(this.meetingScheduleForm.value.RangeTime[0]).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      EstEndTime: dayjs(this.meetingScheduleForm.value.RangeTime[1]).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      IdCreator: this.meetingSchedule?.IdCreator ?? this.authService.decodeToken().Id
    }
    if (this.modeEdit) {
      body.Id = this.meetingSchedule.Id;
    }
    try {
      const result = await this.meetingScheduleService[this.modeEdit ? 'updateMeetingSchedule' : 'createMeetingSchedule'](body);
      if (result.success) {
        const creatorName = this.authService.decodeToken().FullName;
        const positionName = this.authService.decodeToken().PositionName;
        const departmentName = this.authService.decodeToken().DepartmentName;
        const roomName = this.listMeetingRoom.find(item => item.Id === body.IdRoom)?.Name;
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.meetingSchedule?.Id, CreatorName: creatorName, RoomName: roomName, PositionName: positionName, DepartmentName: departmentName, StatusName: this.meetingSchedule?.StatusName || "Mặc định" });
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

  searchDepartment(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetDepartment.search : (this.paramsGetDepartment.search = text);
    this.listDepartment = [];
    this.getListDepartment();
  }

  handlerSelectDepartment(event: string) {
    this.paramsGetPosition.idDepartment = event;
    this.paramsGetPersonnel.idPosition = undefined;
    this.getListPosition();
    this.listPersonnel = [];
    this.getListPersonnel();
  }

  handlerSearchDepartment(event: string) {
    this.paramsGetDepartment.page = 1;
    this.onSearchDepartment.next(event);
  }

  handlerScrollBottomDepartment() {
    if (this.loadingDepartment || !this.totalDepartment || this.totalDepartment <= this.listDepartment.length) {
      return;
    }
    this.paramsGetDepartment.page += 1;
    this.getListDepartment();
  }

  async getListDepartment() {
    if (this.loadingDepartment && !this.firstCallDepartment) {
      return;
    }
    this.firstCallDepartment = false;
    try {
      this.loadingDepartment = true;
      const result = await this.departmentService.getListDepartment(this.paramsGetDepartment);
      this.totalDepartment = result.Total;
      this.listDepartment.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingDepartment = false;
      this.loading = false;
    }
  }

  searchPosition(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPosition.search : (this.paramsGetPosition.search = text);
    this.listPosition = [];
    this.getListPosition();
  }

  handlerSearchPosition(event: string) {
    this.paramsGetPosition.page = 1;
    this.onSearchPosition.next(event);
  }

  async getListPosition() {
    if (this.loadingPosition && !this.firstCallPosition) {
      return;
    }
    this.firstCallPosition = false;
    try {
      this.loadingPosition = true;
      const result = await this.positionService.getListPosition(this.paramsGetPosition);
      this.totalPosition = result.Total;
      this.listPosition = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPosition = false;
    }
  }

  handlerScrollBottomPosition() {
    if (this.loadingPosition || !this.totalPosition || this.totalPosition <= this.listPosition.length) {
      return;
    }
    this.paramsGetPosition.page += 1;
    this.getListPosition();
  }

  handlerSelectPosition() {
    this.listPersonnel = [];
    this.getListPersonnel();
  }

  handlerSearchPersonnel(event: string) {
    this.paramsGetPersonnel.page = 1;
    this.onSearchPersonnel.next(event);
  }

  handlerScrollBottomPersonnel(event: any) {
    if (event.target.scrollTop < (event.target.scrollHeight - event.target.offsetHeight - 30) || this.loadingPersonnel || !this.totalPersonnel || this.totalPersonnel <= this.listPersonnel.length) {
      return;
    }
    this.paramsGetPersonnel.page += 1;
    this.getListPersonnel();
  }

  searchPersonnel(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPersonnel.search : (this.paramsGetPersonnel.search = text);
    this.listPersonnel = [];
    this.getListPersonnel();
  }

  async getListPersonnel() {
    if (this.loadingPersonnel && !this.firstCallPersonnel) {
      return;
    }
    this.firstCallPersonnel = false;
    try {
      this.loadingPersonnel = true;
      const result = await this.personnelService.getListPersonnelFreeTime(this.paramsGetPersonnel);
      this.totalPersonnel = result.Total;
      this.listPersonnel.push(...result.Value?.map(item => {
        const id = item.Id;
        return {
          ...item,
          IdAccount: item.Id,
          Id: this.listPersonnelJoin.find(item => item.IdAccount === id)?.Id || id
        }
      }));
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPersonnel = false;
    }
  }

  handlerKeyUp(event) {
    if (this.paramsGetPersonnel.search === event.target.value) {
      return;
    }
    this.paramsGetPersonnel.page = 1;
    if (event.key === 'Enter') {
      this.searchPersonnel(event.target.value);
      return;
    }
    this.onSearchPersonnel.next(event.target.value);
  }

}
