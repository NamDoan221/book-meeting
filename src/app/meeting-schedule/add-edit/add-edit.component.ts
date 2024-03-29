import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { differenceInCalendarDays } from 'date-fns';
import * as dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { DisabledTimeFn, DisabledTimePartial } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { viewMsDuplicate } from 'src/app/lib/defines/function.define';
import { AttendanceTypeService } from 'src/app/lib/services/attendance-type/attendance-type.service';
import { IAttendanceType } from 'src/app/lib/services/attendance-type/interfaces/attendance-type.interface';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from 'src/app/lib/services/department/interfaces/department.interface';
import { IDataItemGetByTypeDictionary } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { GlobalEventService } from 'src/app/lib/services/global-event.service';
import { IMeetingRoom, IParamsGetListMeetingRoomFreeTime } from 'src/app/lib/services/meeting-room/interfaces/room.interface';
import { MeetingRoomService } from 'src/app/lib/services/meeting-room/meeting-room.service';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meeting-schedule.service';
import { IParamsGetListPersonnelFreeTime, IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';
import { IParamsGetListPosition, IPosition } from 'src/app/lib/services/position/interfaces/position.interface';
import { PositionService } from 'src/app/lib/services/position/position.service';
import * as uuid from 'uuid';
import { BmMeetingScheduleDynamicFieldComponent } from '../dynamic-field/dynamic-field.component';

@Component({
  selector: 'bm-meeting-schedule-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BmMeetingScheduleAddEditComponent implements OnInit {

  isConnectGoogle: boolean;
  meetingScheduleForm: FormGroup;
  loading: boolean;

  totalMeetingRoom: number;
  listMeetingRoom: IMeetingRoom[];
  onSearchMeetingRoom: Subject<string> = new Subject();
  paramsGetMeetingRoom: IParamsGetListMeetingRoomFreeTime;
  loadingMeetingRoom: boolean;
  firstCallMeetingRoom: boolean;

  rangeChange: boolean;
  durationChange: boolean;
  startTime: Date;

  listPersonnelGuest: IPersonnel[];
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

  attendanceType: IAttendanceType[];
  keyFetch: string;
  listPersonnelOther: IPersonnel[];
  listPersonnelClone: IPersonnel[];

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) < 0;

  disabledDateTime: DisabledTimeFn = (current: Date, type?: DisabledTimePartial) => {
    if (type === 'start') {
      this.startTime = current;
      const currentCompareToday = differenceInCalendarDays(current, new Date()) > 0;
      const currentHours = current?.getHours();
      let numberDisableHours = 0;
      let numberDisableMinutes = 0;
      if (!currentCompareToday) {
        const minutes = new Date().getMinutes() + 15;
        const hours = new Date().getHours();
        if (currentHours < hours) {
          numberDisableHours = hours;
          numberDisableMinutes = 60;
        } else if (currentHours === hours) {
          numberDisableHours = hours;
          if (minutes <= 60) {
            numberDisableMinutes = minutes;
          } else {
            numberDisableHours = hours + 1;
            numberDisableMinutes = 0;
          }
        }
      }
      return {
        nzDisabledHours: () => [...this.range(0, 24).splice(0, 8), ...this.range(0, 24).splice(19, 5), ...this.range(0, numberDisableHours)],
        nzDisabledMinutes: () => this.range(0, numberDisableMinutes),
        nzDisabledSeconds: () => []
      };
    }
    const currentCompareToday = differenceInCalendarDays(current, new Date()) > 0;
    const currentHours = current?.getHours();
    let numberDisableHours = 0;
    let numberDisableMinutes = 0;
    let rangeHourExtend = [];
    let rangeMinutesExtend = [];
    if (!currentCompareToday) {
      const minutes = new Date().getMinutes() + 15;
      const hours = new Date().getHours();
      if (currentHours < hours) {
        numberDisableHours = hours;
        numberDisableMinutes = 60;
      } else if (currentHours === hours) {
        numberDisableHours = hours;
        if (minutes <= 60) {
          numberDisableMinutes = minutes;
        } else {
          numberDisableHours = hours + 1;
          numberDisableMinutes = 0;
        }
      }
      if (this.startTime?.getHours() === currentHours) {
        const startTimeMinutes = this.startTime?.getMinutes() + 5;
        if (startTimeMinutes) {
          if (startTimeMinutes < 60) {
            rangeMinutesExtend = this.range(0, 60).splice(0, startTimeMinutes)
          } else {
            rangeHourExtend = [this.startTime?.getHours()];
            rangeMinutesExtend = this.range(0, 60).splice(0, startTimeMinutes - 60)
          }
        }
      }
    } else {
      const startTimeMinutes = this.startTime?.getMinutes() + 5;
      if (this.startTime?.getHours() === currentHours) {
        if (startTimeMinutes) {
          if (startTimeMinutes < 60) {
            rangeMinutesExtend = this.range(0, 60).splice(0, startTimeMinutes)
          } else {
            rangeHourExtend = [this.startTime?.getHours()];
            rangeMinutesExtend = this.range(0, 60).splice(0, startTimeMinutes - 60)
          }
        }
      } else if (this.startTime?.getHours() < currentHours) {
        if (startTimeMinutes) {
          if (startTimeMinutes > 60) {
            rangeMinutesExtend = this.range(0, 60).splice(0, startTimeMinutes - 60)
          }
        }
      }
    }
    return {
      nzDisabledHours: () => [...this.range(0, 24).splice(0, 8), ...this.range(0, 24).splice(19, 5), ...this.range(0, numberDisableHours), ...rangeHourExtend],
      nzDisabledMinutes: () => [...this.range(0, numberDisableMinutes), ...rangeMinutesExtend],
      nzDisabledSeconds: () => []
    };
  };

  @Input() meetingSchedule: IMeetingSchedule;
  @Input() modeEdit: boolean;
  @Input() disable: boolean;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();
  @Output() close = new EventEmitter<void>();

  @ViewChildren('dynamicField') dynamicFieldRef: QueryList<BmMeetingScheduleDynamicFieldComponent>;

  constructor(
    private fb: FormBuilder,
    private meetingRoomService: MeetingRoomService,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private personnelService: PersonnelService,
    private router: Router,
    private globalEventService: GlobalEventService,
    private attendanceTypeService: AttendanceTypeService,
    private notificationService: NzNotificationService
  ) {
    this.loading = false;
    this.listMeetingRoom = [];
    this.paramsGetMeetingRoom = {
      page: 1,
      pageSize: 100,
      search: '',
      from: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      active: true
    }
    this.loadingMeetingRoom = true;
    this.firstCallMeetingRoom = true;
    this.rangeChange = false;
    this.durationChange = false;

    this.listPersonnelGuest = [];
    this.listPersonnel = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 100,
      from: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      search: ''
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;

    this.totalDepartment = 0;
    this.listDepartment = [];
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 100,
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
      pageSize: 100,
      search: ''
    };
    this.keyFetch = uuid();
    this.listPersonnelOther = [];
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
    this.getAttendanceType();
  }

  initData() {
    this.isConnectGoogle = this.authService.decodeToken().IsConnectedGG;
    this.meetingScheduleForm = this.fb.group({
      Title: [this.meetingSchedule?.Title || '', [Validators.required]],
      Code: [this.meetingSchedule?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      RangeTime: [this.meetingSchedule?.EstStartTime && this.meetingSchedule?.EstEndTime ? [new Date(this.meetingSchedule?.EstStartTime), new Date(this.meetingSchedule?.EstEndTime)] : [], [Validators.required]],
      EstDuration: [this.meetingSchedule?.EstDuration ? this.meetingSchedule?.EstDuration : '', [Validators.required]],
      IdRoom: [this.meetingSchedule?.IdRoom || '', [Validators.required]],
      Content: [this.meetingSchedule?.Content || ''],
      IsSyncGGCalendar: [{ value: this.meetingSchedule?.IsSyncGGCalendar || false, disabled: this.isConnectGoogle ? false : true }]
    });
    if (this.meetingSchedule?.EstStartTime) {
      this.paramsGetMeetingRoom.from = dayjs(this.meetingSchedule.EstStartTime).format('YYYY-MM-DDTHH:mm:ss')
      this.paramsGetPersonnel.from = dayjs(this.meetingSchedule.EstStartTime).format('YYYY-MM-DDTHH:mm:ss')
    }
    if (this.meetingSchedule?.EstEndTime) {
      this.paramsGetMeetingRoom.to = dayjs(this.meetingSchedule.EstEndTime).format('YYYY-MM-DDTHH:mm:ss')
      this.paramsGetPersonnel.to = dayjs(this.meetingSchedule.EstEndTime).format('YYYY-MM-DDTHH:mm:ss')
    }
  }

  handlerConnect(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/account']);
    this.globalEventService.UrlReplaceBehaviorSubject.next('/account');
    this.close.emit();
  }

  rangeTimeChange(result: Date[]) {
    if (this.durationChange) {
      return;
    }
    this.rangeChange = true;
    setTimeout(() => {
      this.rangeChange = false;
    }, 250);
    const duration = dayjs(result[1]).diff(dayjs(result[0]), 'minute', false);
    this.meetingScheduleForm.controls.EstDuration.setValue(duration);
    this.refreshMeetingRoomAndPersonnelWhenChangeTime(result);
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
      const rangeTime = [dayjs(this.meetingScheduleForm.controls.RangeTime.value[0]).toDate(), dayjs(this.meetingScheduleForm.controls.RangeTime.value[0]).add(event, 'minute').toDate()];
      this.meetingScheduleForm.controls.RangeTime.setValue(rangeTime);
      this.refreshMeetingRoomAndPersonnelWhenChangeTime(rangeTime);
      return;
    }
    const rangeTime = [dayjs().add(15, 'minute').toDate(), dayjs().add(15 + event, 'minute').toDate()];
    this.meetingScheduleForm.controls.RangeTime.setValue(rangeTime);
    this.refreshMeetingRoomAndPersonnelWhenChangeTime(rangeTime);
  }

  refreshMeetingRoomAndPersonnelWhenChangeTime(result: Date[]) {
    this.paramsGetMeetingRoom.from = dayjs(result[0]).format('YYYY-MM-DDTHH:mm:ss');
    this.paramsGetMeetingRoom.to = dayjs(result[1]).format('YYYY-MM-DDTHH:mm:ss');
    this.listMeetingRoom = [];
    this.paramsGetMeetingRoom.page = 1;
    this.getListMeetingRoom();
    this.paramsGetPersonnel.from = dayjs(result[0]).format('YYYY-MM-DDTHH:mm:ss');
    this.paramsGetPersonnel.to = dayjs(result[1]).format('YYYY-MM-DDTHH:mm:ss');
    this.listPersonnel = [];
    this.paramsGetPersonnel.page = 1;
    this.getListPersonnel();
    this.dynamicFieldRef.toArray().forEach(item => item.updateParamsGetPersonnel(result))
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
      const roomSelected = result.Value.find(room => room.Id === this.meetingScheduleForm.get('IdRoom').value);
      if (roomSelected?.CountMsDuplicate > 0) {
        this.meetingScheduleForm.get('IdRoom').reset();
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingMeetingRoom = false;
    }
  }

  async handlerSave(event: Event) {
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
    const estStartTime = dayjs(this.meetingScheduleForm.value.RangeTime[0]).format('YYYY-MM-DDTHH:mm:ss');
    const estEndTime = dayjs(this.meetingScheduleForm.value.RangeTime[1]).format('YYYY-MM-DDTHH:mm:ss');
    const rangeTime = this.meetingScheduleForm.value.RangeTime;
    delete this.meetingScheduleForm.value.RangeTime;
    const body: IMeetingSchedule = {
      ...this.meetingScheduleForm.value,
      EstStartTime: estStartTime,
      EstEndTime: estEndTime,
      IdCreator: this.meetingSchedule?.IdCreator ?? this.authService.decodeToken().Id
    }
    this.attendanceType.forEach(item => {
      const data = { IdAccount: this.meetingScheduleForm.value[item.Code], IdAttendanceType: item.Id };
      body.MeetingScheduleDtls && body.MeetingScheduleDtls.length ? body.MeetingScheduleDtls.push(data) : body.MeetingScheduleDtls = [data];
      delete body[item.Code];
    });
    this.listPersonnelGuest.forEach(item => {
      const data = { IdAccount: item.Id, IdAttendanceType: undefined };
      body.MeetingScheduleDtls && body.MeetingScheduleDtls.length ? body.MeetingScheduleDtls.push(data) : body.MeetingScheduleDtls = [data];
    })
    if (this.modeEdit) {
      body.Id = this.meetingSchedule.Id;
    }
    const maxPersonalInRoom = this.listMeetingRoom.find(item => item.Id === body.IdRoom).AmountSlot;
    if (body.MeetingScheduleDtls.length > maxPersonalInRoom) {
      this.nzMessageService.error('Số lượng người tham gia vượt quá sức chứa của phòng họp.');
      this.loading = false;
      this.meetingScheduleForm.value.RangeTime = rangeTime;
      return;
    }
    try {
      const result = await this.meetingScheduleService[this.modeEdit ? 'updateMeetingSchedule' : 'createMeetingSchedule'](body);
      if (result.success) {
        const creatorName = this.authService.decodeToken().FullName;
        const positionName = this.authService.decodeToken().PositionName;
        const departmentName = this.authService.decodeToken().DepartmentName;
        const roomName = this.listMeetingRoom.find(item => item.Id === body.IdRoom)?.Name;
        this.saveSuccess.emit({ ...body, Id: result.result.Id ?? this.meetingSchedule?.Id, CreatorName: creatorName, RoomName: roomName, PositionName: positionName, DepartmentName: departmentName, StatusName: this.meetingSchedule?.StatusName || "Mặc định", StatusCode: this.meetingSchedule?.StatusCode || "MS_DEFAULT", CreatorAvatar: this.meetingSchedule?.CreatorAvatar || this.authService.decodeToken().AvatarUrl });
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      console.log(error);
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }
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

  handlerScrollPersonnel(event: any) {
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
          Id: this.listPersonnelGuest.find(item => item.IdAccount === id)?.Id || id
        }
      }));
      this.listPersonnelClone = cloneDeep(this.listPersonnel);
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

  async getAttendanceType() {
    try {
      const result = await this.attendanceTypeService.getListAttendanceTypeActive({ page: 1, pageSize: 100 });
      this.attendanceType = result.Value.sort((a, b) => a.Index - b.Index);
      this.attendanceType.forEach(item => {
        const itemFound = this.meetingSchedule?.MeetingScheduleDtls?.find(element => element.IdAttendanceType === item.Id);
        this.meetingScheduleForm.addControl(item.Code, new FormControl(itemFound?.IdAccount ?? '', item.IsRequired ? [Validators.required] : []));
      });
      const listGuest = [...(this.meetingSchedule?.MeetingScheduleDtls || [])].filter(item => !item.IdAttendanceType);
      const listGuestMap: IPersonnel[] = listGuest.map(item => {
        return {
          Id: item.IdAccount,
          IdAccount: item.IdAccount
        }
      })
      this.listPersonnelGuest = listGuestMap;
    } catch (error) {
      console.log(error);
    }
  }

  handlerScrollBottomPersonnel() {
    if (this.loadingPersonnel || !this.totalPersonnel || this.totalPersonnel <= this.listPersonnel.length) {
      return;
    }
    this.paramsGetPersonnel.page += 1;
    this.getListPersonnel();
  }

  handlerAddPersonnelToMeetingSchedule(event: boolean, personnel: IPersonnel) {
    if (event) {
      this.listPersonnelGuest = [...this.listPersonnelGuest, personnel];
      return;
    }
    this.listPersonnelGuest = this.listPersonnelGuest.filter(item => item.IdAccount !== personnel.IdAccount);
  }

  handlerSelectedChange(event: string, item: IDataItemGetByTypeDictionary) {
    this.listPersonnelOther = this.listPersonnelOther.filter(person => person.IdAttendanceType !== item.Id);
    this.listPersonnelOther.push({ IdAccount: event, IdAttendanceType: item.Id, });
    this.listPersonnel = [...this.listPersonnelClone].filter(item => !this.listPersonnelOther.find(element => element.IdAccount === item.IdAccount));
  }

  async handlerViewMsDuplicate(event: Event, idMsDuplicate: string) {
    event.stopPropagation();
    viewMsDuplicate(this.notificationService, this.meetingScheduleService, idMsDuplicate);
  }
}
