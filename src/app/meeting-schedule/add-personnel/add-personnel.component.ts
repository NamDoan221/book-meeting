import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { interval, Subject, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from 'src/app/lib/services/department/interfaces/department.interface';
import { DictionaryService } from 'src/app/lib/services/dictionary/dictionary.service';
import { IDataItemGetByTypeDictionary } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { IMeetingSchedule, IMeetingScheduleJoin } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meeting-schedule.service';
import { IParamsGetListPersonnelFreeTime, IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';
import { IParamsGetListPosition, IPosition } from 'src/app/lib/services/position/interfaces/position.interface';
import { PositionService } from 'src/app/lib/services/position/position.service';
import { cloneDeep } from 'lodash';
import * as uuid from 'uuid';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { Router } from '@angular/router';
import { GlobalEventService } from 'src/app/lib/services/global-event.service';

@Component({
  selector: 'bm-meeting-schedule-add_personnel',
  templateUrl: './add-personnel.component.html',
  styleUrls: ['./add-personnel.component.scss']
})
export class BmMeetingScheduleAddPersonnelComponent implements OnInit, OnDestroy {

  allPersonnelJoin: IPersonnel[];
  loading: boolean;
  listPersonnelGuest: IPersonnel[];
  listPersonnelGuestSearch: IPersonnel[];
  listPersonnelGuestClone: IPersonnel[];
  disableChangePersonnelJoin: boolean;
  modeAdd: boolean;
  guestType: IDataItemGetByTypeDictionary;
  listPersonnelOther: IPersonnel[];
  listPersonnelOtherClone: IPersonnel[];

  totalPersonnel: number;
  listPersonnel: IPersonnel[];
  listPersonnelClone: IPersonnel[];
  onSearchPersonnel: Subject<string> = new Subject();
  paramsGetPersonnel: IParamsGetListPersonnelFreeTime;
  loadingPersonnel: boolean;
  canLoadMorePersonal: boolean;
  firstCallPersonnel: boolean;

  paramsGetDetail: { search: string, active: boolean };
  loadingDetail: boolean;
  firstCallDetail: boolean;
  onSearchDetail: Subject<string> = new Subject();

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

  meetingPositionType: IDataItemGetByTypeDictionary[];

  personnelJoinForm: FormGroup;

  keyFetch: string;
  keyFetchStatus: string;
  intervalSub: Subscription;

  meetingScheduleForm: FormGroup;
  isConnectGoogle: boolean;

  roomName: string;

  @Input() meetingSchedule: IMeetingSchedule;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();
  @Output() attendance = new EventEmitter<IMeetingSchedule>();
  @Output() close = new EventEmitter<void>();

  constructor(
    private personnelService: PersonnelService,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private dictionaryService: DictionaryService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private globalEventService: GlobalEventService
  ) {
    this.modeAdd = false;
    this.listPersonnelGuest = [];
    this.listPersonnelGuestSearch = [];
    this.loading = false;
    this.listPersonnelOther = [];

    this.listPersonnel = [];
    this.listPersonnelClone = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 20,
      from: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm:ss'),
      search: ''
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;
    this.disableChangePersonnelJoin = false;
    this.canLoadMorePersonal = true;

    this.paramsGetDetail = {
      search: '',
      active: true
    }

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
    this.keyFetchStatus = '';
    this.intervalSub = interval(300000).subscribe(() => this.keyFetchStatus = uuid());
  }

  async ngOnInit(): Promise<void> {
    if (this.meetingSchedule?.EstStartTime) {
      // this.paramsGetMeetingRoom.from = dayjs(this.meetingSchedule.EstStartTime).format('YYYY-MM-DDTHH:mm:ss')
      this.paramsGetPersonnel.from = dayjs(this.meetingSchedule.EstStartTime).format('YYYY-MM-DDTHH:mm:ss')
    }
    if (this.meetingSchedule?.EstEndTime) {
      // this.paramsGetMeetingRoom.to = dayjs(this.meetingSchedule.EstEndTime).format('YYYY-MM-DDTHH:mm:ss')
      this.paramsGetPersonnel.to = dayjs(this.meetingSchedule.EstEndTime).format('YYYY-MM-DDTHH:mm:ss')
    }
    this.roomName = this.meetingSchedule.RoomName;
    this.isConnectGoogle = this.authService.decodeToken().IsConnectedGG;
    this.meetingScheduleForm = this.fb.group({
      Title: [this.meetingSchedule?.Title || '', [Validators.required]],
      IdRoom: [this.meetingSchedule?.IdRoom || '', [Validators.required]],
      Content: [this.meetingSchedule?.Content || ''],
      IsSyncGGCalendar: [{ value: this.meetingSchedule?.IsSyncGGCalendar || false, disabled: this.isConnectGoogle ? false : true }]
    });
    this.personnelJoinForm = this.fb.group({});
    if (this.meetingSchedule &&
      (dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) > 0 && dayjs(this.meetingSchedule.EstStartTime).diff(dayjs(), 'minute', false) < 0) ||
      dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) < 0 || this.meetingSchedule.StatusCode !== 'MS_DEFAULT') {
      this.disableChangePersonnelJoin = true;
    }
    this.onSearchPersonnel.pipe(debounceTime(500), filter(value => value !== this.paramsGetPersonnel.search)).subscribe((value) => {
      this.searchPersonnel(value);
    });
    this.onSearchDetail.pipe(debounceTime(500), filter(value => value !== this.paramsGetDetail.search)).subscribe((value) => {
      this.searchDetail(value);
    });
    this.onSearchPosition.pipe(debounceTime(500), filter(value => value !== this.paramsGetPosition.search)).subscribe((value) => {
      this.searchPosition(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListDepartment();
    this.getListPosition();
    await this.getDetailMeetingSchedule();
    this.getListPersonnel();
  }

  async getMeetingPositionType(dataDetail: IPersonnel[]) {
    this.listPersonnelOther = [];
    try {
      const result = await this.dictionaryService.getListDataByTypeDictionary('POSITION_MEETING_SCHEDULE');
      this.meetingPositionType = result.filter(item => {
        if (item.Code === 'GUEST') {
          this.guestType = item;
          return false;
        }
        const itemFound = dataDetail.find(element => element.IdAttendanceType === item.Id);
        this.listPersonnelOther.push(itemFound);
        this.personnelJoinForm.addControl(item.Code, new FormControl(itemFound?.IdAccount ?? '', [Validators.required]));
        return true;
      });
      this.listPersonnelOtherClone = cloneDeep(this.listPersonnelOther);
      if (this.guestType) {
        const listGuest = [...dataDetail].filter(item => item.IdAttendanceType === this.guestType.Id);
        const listGuestMap: IPersonnel[] = listGuest.map(item => {
          return {
            ...item,
            IdAccount: item.IdAccount
          }
        })
        this.listPersonnelGuest = listGuestMap;
        this.listPersonnelGuestClone = cloneDeep(this.listPersonnelGuest);
      };
    } catch (error) {
      console.log(error);
    }
  }

  searchDetail(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetDetail.search : (this.paramsGetDetail.search = text);
    this.listPersonnelGuestSearch = [];
    this.getDetailMeetingSchedule(true);
  }

  async getDetailMeetingSchedule(isSearch: boolean = false) {
    this.loadingDetail = true;
    try {
      const result = await this.meetingScheduleService.getDetailMeetingSchedule(this.meetingSchedule.Id, this.paramsGetDetail);
      if (isSearch) {
        this.listPersonnelGuestSearch = result.Value;
        return;
      }
      this.allPersonnelJoin = cloneDeep(result.Value);
      await this.getMeetingPositionType(result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingDetail = false;
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

  handlerKeyUpPersonnelJoin(event) {
    if (this.paramsGetDetail.search === event.target.value) {
      return;
    }
    if (event.key === 'Enter') {
      this.searchDetail(event.target.value);
      return;
    }
    this.onSearchDetail.next(event.target.value);
  }

  handlerChangeModeAdd(event: Event) {
    event.stopPropagation();
    this.modeAdd = true;
  }

  handlerBack(event: Event) {
    event.stopPropagation();
    this.modeAdd = false;
    let data = {};
    this.listPersonnelOtherClone.forEach(item => {
      const positionType = this.meetingPositionType.find(element => element.Id === item.IdAttendanceType);
      if (!positionType) {
        return;
      }
      data = {
        ...data,
        [positionType.Code]: item.IdAccount
      }
    });
    this.personnelJoinForm.setValue(data);
    this.meetingScheduleForm.setValue({
      Title: this.meetingSchedule?.Title || '',
      IdRoom: this.meetingSchedule?.IdRoom || '',
      Content: this.meetingSchedule?.Content || '',
      IsSyncGGCalendar: this.meetingSchedule?.IsSyncGGCalendar || false
    })
  }

  handlerSearchPersonnel(event: string) {
    this.paramsGetPersonnel.page = 1;
    this.onSearchPersonnel.next(event);
  }

  handlerScrollBottomPersonnel(event: any) {
    if (event.target.scrollTop < (event.target.scrollHeight - event.target.offsetHeight - 3) || this.loadingPersonnel || !this.totalPersonnel || !this.canLoadMorePersonal) {
      return;
    }
    this.paramsGetPersonnel.page += 1;
    this.getListPersonnel();
  }

  searchPersonnel(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPersonnel.search : (this.paramsGetPersonnel.search = text);
    this.listPersonnel = [];
    this.listPersonnelClone = [];
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
      if (!result.Value.length) {
        this.canLoadMorePersonal = false;
      }
      this.totalPersonnel = result.Total;
      this.listPersonnelClone = [...this.listPersonnelClone, ...result.Value].map(item => {
        const id = item.Id;
        return {
          ...item,
          IdAccount: id
        }
      });
      const guestData = [];
      result.Value.forEach(item => {
        const id = item.Id;
        const itemFound = this.listPersonnelOther?.find(element => element?.IdAccount === id);
        if (!itemFound) {
          guestData.push({
            ...item,
            IdAccount: id
          });
        }
      });
      this.listPersonnel = [...this.listPersonnel, ...guestData];
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPersonnel = false;
    }
  }

  handlerAddGuestToMeetingSchedule(event: boolean, personnel: IPersonnel) {
    if (event) {
      this.listPersonnelGuestClone = [...this.listPersonnelGuestClone, personnel];
      this.keyFetch = uuid();
      return;
    }
    this.listPersonnelGuestClone = this.listPersonnelGuestClone.filter(item => item.IdAccount !== personnel.IdAccount);
    this.keyFetch = uuid();
  }

  handlerRemovePersonnelJoin(event: Event, personnel: IPersonnel) {
    event.stopPropagation();
    this.handlerDelete(personnel.Id);
    this.listPersonnelGuest = this.listPersonnelGuest.filter(item => item.IdAccount !== personnel.IdAccount);
    this.listPersonnelGuestClone = cloneDeep(this.listPersonnelGuest)
  }

  async handlerDelete(id: string, showMessage: boolean = true) {
    try {
      this.loading = true;
      const result = await this.meetingScheduleService.deletePersonnelInMeetingSchedule(id);
      if (result.success) {
        showMessage && this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      showMessage && this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      showMessage && this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }
  }

  handlerErrorImage(e: any) {
    if (e.target && e.target.src && e.target.src !== 'https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg') {
      e.target.src = 'https://t3.ftcdn.net/jpg/02/09/37/00/360_F_209370065_JLXhrc5inEmGl52SyvSPeVB23hB6IjrR.jpg';
    }
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

  handlerAttendance(event: Event) {
    event.stopPropagation();
    this.attendance.emit(this.meetingSchedule);
  }

  validate() {
    let valid = true;
    if (!this.personnelJoinForm.valid) {
      Object.values(this.personnelJoinForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      valid = false;
    }
    if (!this.meetingScheduleForm.valid) {
      Object.values(this.meetingScheduleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      valid = false;
    }
    return valid;
  }

  async handlerSaveScheduleMeetingGuest(event: Event) {
    event.stopPropagation();
    if (!this.validate()) {
      return;
    }
    const body: IMeetingScheduleJoin[] = [];
    this.meetingPositionType.forEach(item => {
      if (item.Code === 'GUEST') {
        return;
      }
      const data = { IdAccount: this.personnelJoinForm.value[item.Code], IdAttendanceType: item.Id };
      body.push(data);
    });
    this.listPersonnelGuestClone.forEach(item => {
      const data = { IdAccount: item.Id, IdAttendanceType: this.guestType.Id };
      body.push(data);
    });
    const dataPromise = [];
    this.allPersonnelJoin.forEach(item => {
      dataPromise.push(this.handlerDelete(item.Id, false));
    });
    dataPromise.push(this.meetingScheduleService.updateMeetingSchedule({ Id: this.meetingSchedule.Id, ...this.meetingScheduleForm.value }));
    await Promise.all(dataPromise);
    this.meetingSchedule = {
      ...this.meetingSchedule,
      ...this.meetingScheduleForm.value,
      RoomName: this.roomName
    }
    try {
      this.loading = true;
      const result = await this.meetingScheduleService.addListPersonnelToMeetingSchedule(body, this.meetingSchedule.Id);
      if (result.success) {
        this.getDetailMeetingSchedule();
        this.modeAdd = false;
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

  handlerSelectedChange(event: string, item: IDataItemGetByTypeDictionary) {
    this.listPersonnelOther = this.listPersonnelOther.filter(person => person.IdAttendanceType !== item.Id);
    this.listPersonnelOther.push({ IdAccount: event, IdAttendanceType: item.Id, });
    this.listPersonnel = [...this.listPersonnelClone].filter(item => !this.listPersonnelOther.find(element => element.IdAccount === item.IdAccount));
  }

  handlerConnect(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/account']);
    this.globalEventService.UrlReplaceBehaviorSubject.next('/account');
    this.close.emit();
  }

  handlerRoomChange(event: string) {
    this.roomName = event;
  }

  ngOnDestroy(): void {
    this.intervalSub.unsubscribe();
  }
}
