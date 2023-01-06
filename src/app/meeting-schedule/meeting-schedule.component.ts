import { Component, OnDestroy, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { interval, Subject, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from '../lib/services/auth/auth.service';
import { DepartmentService } from '../lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { IMeetingSchedule, IParamsGetListMeetingSchedule } from '../lib/services/meeting-schedule/interfaces/meeting-schedule.interface';
import { MeetingScheduleService } from '../lib/services/meeting-schedule/meeting-schedule.service';
import { IParamsGetListPersonnel, IPersonnel } from '../lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from '../lib/services/personnel/personnel.service';
import { BmMeetingScheduleAddEditComponent } from './add-edit/add-edit.component';
import { BmMeetingScheduleAddPersonnelComponent } from './add-personnel/add-personnel.component';
import { BmMeetingScheduleAttendanceComponent } from './attendance/attendance.component';
import * as uuid from 'uuid';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'bm-meeting-schedule',
  templateUrl: './meeting-schedule.component.html',
  styleUrls: ['./meeting-schedule.component.scss']
})
export class BmMeetingScheduleComponent implements OnInit, OnDestroy {

  columnConfig: string[];
  isOpenDrawAddEdit: boolean;
  isOpenDrawAddPersonnel: boolean;
  isOpenDrawAttendance: boolean;
  drawerRefGlobal: NzDrawerRef;
  options: string[];
  selectedFilterTimeIndex: number;
  idAccount: string;

  loading: boolean;
  total: number;
  listMeetingSchedule: IMeetingSchedule[];
  firstCall: boolean;
  params: IParamsGetListMeetingSchedule;
  onSearch: Subject<string> = new Subject();
  defaultFilterTime: string[];
  functionCallListMeetingSchedule: string;

  totalDepartment: number;
  listDepartment: IDepartment[];
  firstCallDepartment: boolean;
  loadingDepartment: boolean;
  onSearchDepartment: Subject<string> = new Subject();
  paramsGetDepartment: IParamsGetListDepartment;

  totalPersonnel: number;
  listPersonnel: IPersonnel[];
  firstCallPersonnel: boolean;
  loadingPersonnel: boolean;
  onSearchPersonnel: Subject<string> = new Subject();
  paramsGetPersonnel: IParamsGetListPersonnel;

  dataView: { key: string, label: string }[];
  dataViewSelected: string;

  keyFetch: string;
  intervalSub: Subscription;

  loadingReSyncGoogleCalendar: boolean;

  constructor(
    private drawerService: NzDrawerService,
    private departmentService: DepartmentService,
    private meetingScheduleService: MeetingScheduleService,
    private personnelService: PersonnelService,
    private authService: AuthService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
    this.total = 0;
    this.listMeetingSchedule = [];
    this.isOpenDrawAddEdit = false;
    this.isOpenDrawAddPersonnel = false;
    this.isOpenDrawAttendance = false;
    this.columnConfig = [
      'Tên cuộc họp',
      'Thời gian diễn ra',
      'Thời lượng dự kiến',
      'Phòng họp',
      'Người quản lý cuộc họp',
      'Phòng ban',
      'Số nhân viên được tham gia',
      'Trạng thái đồng bộ google calendar',
      'Mô tả nội dung cuộc họp',
      'Trạng thái'
    ];
    this.defaultFilterTime = [dayjs().startOf('month').format('YYYY-MM-DDTHH:mm:ss'), dayjs().endOf('month').format('YYYY-MM-DDTHH:mm:ss')];
    this.params = {
      page: 1,
      pageSize: 20,
      from: this.defaultFilterTime[0],
      to: this.defaultFilterTime[1],
      search: ''
    };
    this.firstCall = true;

    this.totalDepartment = 0;
    this.listDepartment = [];
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 20,
      active: true,
      search: ''
    }
    this.loadingDepartment = true;
    this.firstCallDepartment = true;

    this.totalPersonnel = 0;
    this.listPersonnel = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 20,
      active: true,
      search: ''
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;
    this.options = ['Ngày', 'Tuần', 'Tháng', 'Quý', 'Năm', 'Tự chọn'];
    this.selectedFilterTimeIndex = 2;
    this.idAccount = this.authService.decodeToken().Id;

    this.dataView = [{
      key: 'all',
      label: 'Tất cả lịch họp'
    },
    {
      key: 'creator',
      label: 'Lịch họp của tôi'
    },
    {
      key: 'personal',
      label: 'Lịch họp cần tham gia'
    }];
    this.dataViewSelected = 'all';
    this.functionCallListMeetingSchedule = 'getListMeetingSchedule';
    this.keyFetch = '';
    this.intervalSub = interval(300000).subscribe(() => this.keyFetch = uuid());
  }

  ngOnInit(): void {
    const rolesMeetingSchedule = this.authService.decodeToken().Roles.find(role => role.Url === '/meeting-schedule');
    const roleViewAll = rolesMeetingSchedule.RoleChilds.find(child => child.FunctionCode === 'VIEW_ALL_SCHEDULE');
    if (rolesMeetingSchedule && (!roleViewAll || (roleViewAll && !roleViewAll.Active))) {
      this.dataView.splice(0, 1);
      this.dataViewSelected = 'creator';
      this.functionCallListMeetingSchedule = 'getListMeetingScheduleCreator';
      this.params.idCreator = this.idAccount;
    }
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchMeetingSchedule(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.onSearchPersonnel.pipe(debounceTime(500), filter(value => value !== this.paramsGetPersonnel.search)).subscribe((value) => {
      this.searchPersonnel(value);
    });
    if (this.dataViewSelected === 'all') {
      this.getListDepartment();
      this.getListPersonnel();
    }
    this.getListMeetingSchedule();
  }

  handlerSelectViewType(event: string) {
    this.dataViewSelected = event;
    switch (event) {
      case 'all':
        this.functionCallListMeetingSchedule = 'getListMeetingSchedule';
        delete this.params.idAccount;
        delete this.params.idCreator;
        break;
      case 'creator':
        this.functionCallListMeetingSchedule = 'getListMeetingScheduleCreator';
        this.params.idCreator = this.idAccount;
        delete this.params.idDepartment;
        delete this.params.idAccount;
        break;
      case 'personal':
        this.functionCallListMeetingSchedule = 'getListMeetingSchedulePersonal';
        this.params.idAccount = this.idAccount;
        delete this.params.idDepartment;
        delete this.params.idCreator;
        break;
    }
    this.getListMeetingSchedule();
  }

  handleFilterTimeChange(e: number) {
    let timeKey;
    switch (e) {
      case 0:
        timeKey = 'day';
        break;
      case 1:
        timeKey = 'isoWeek';
        break;
      case 2:
        timeKey = 'month';
        break;
      case 3:
        timeKey = 'quarter';
        break;
      case 4:
        timeKey = 'year';
        break;
      case 5:
        return;
    }
    this.defaultFilterTime = [dayjs().startOf(timeKey).format('YYYY-MM-DDTHH:mm:ss'), dayjs().endOf(timeKey).format('YYYY-MM-DDTHH:mm:ss')];
    this.params.from = this.defaultFilterTime[0];
    this.params.to = this.defaultFilterTime[1];
    this.getListMeetingSchedule();
  }

  searchMeetingSchedule(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listMeetingSchedule = [];
    this.firstCall = true;
    this.getListMeetingSchedule();
  }

  async getListMeetingSchedule() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.meetingScheduleService[this.functionCallListMeetingSchedule](this.params);
      this.total = result.Total;
      this.listMeetingSchedule = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerKeyUp(event) {
    if (this.params.search === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchMeetingSchedule(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  handlerSelectedFilterTime(result: Date[]): void {
    if (dayjs(this.params.from).isSame(dayjs(result[0])) && dayjs(this.params.to).isSame(dayjs(result[1]))) {
      return;
    }
    this.params.from = dayjs(result[0]).format('YYYY-MM-DDTHH:mm:ss');
    this.params.to = dayjs(result[1]).format('YYYY-MM-DDTHH:mm:ss');
    this.getListMeetingSchedule();
  }

  handlerAddMeetingSchedule(event: Event) {
    event.stopPropagation();
    if (!this.authService.checkPermission('/meeting-schedule', 'ADD_SCHEDULE')) {
      return;
    }
    this.addOrEdit(undefined);
  }

  handlerEditMeetingSchedule(event: Event, item: any) {
    event.stopPropagation();
    if (!this.authService.checkPermission('/meeting-schedule', 'EDIT_SCHEDULE')) {
      return;
    }
    this.addOrEdit(item);
  }

  addOrEdit(schedule: IMeetingSchedule) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<BmMeetingScheduleAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '40vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: schedule ? `Sửa lịch họp` : 'Thêm lịch họp',
      nzContent: BmMeetingScheduleAddEditComponent,
      nzContentParams: {
        meetingSchedule: schedule,
        modeEdit: schedule ? true : false,
        disable: schedule ? dayjs(schedule.EstStartTime).diff(dayjs(), 'minute', false) < 0 : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
        if (schedule) {
          Object.assign(schedule, data);
          return;
        }
        this.listMeetingSchedule = [data, ...this.listMeetingSchedule];
        setTimeout(() => {
          this.handlerAddPersonnel({ stopPropagation: () => { } } as Event, data);
        }, 500);
      });
      this.drawerRefGlobal.getContentComponent().close.subscribe(() => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal.close();
    });
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListMeetingSchedule();
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

  handlerScrollBottomDepartment() {
    if (this.loadingDepartment || !this.totalDepartment || this.totalDepartment <= this.listDepartment.length) {
      return;
    }
    this.paramsGetDepartment.page += 1;
    this.getListDepartment();
  }

  handlerSelectDepartment(event: string) {
    this.firstCall = true;
    this.paramsGetPersonnel.idDepartment = event;
    this.params.idCreator = undefined;
    this.getListPersonnel();
    this.getListMeetingSchedule();
  }

  handlerSearchDepartment(event: string) {
    this.paramsGetDepartment.page = 1;
    this.onSearchDepartment.next(event);
  }

  async getListPersonnel() {
    if (this.loadingPersonnel && !this.firstCallPersonnel) {
      return;
    }
    this.firstCallPersonnel = false;
    try {
      this.loadingPersonnel = true;
      const result = await this.personnelService.getListPersonnel(this.paramsGetPersonnel);
      this.totalPersonnel = result.Total;
      this.listPersonnel.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPersonnel = false;
      this.loading = false;
    }
  }

  searchPersonnel(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPersonnel.search : (this.paramsGetPersonnel.search = text);
    this.listPersonnel = [];
    this.getListPersonnel();
  }

  handlerScrollBottomPersonnel() {
    if (this.loadingPersonnel || !this.totalPersonnel || this.totalPersonnel <= this.listPersonnel.length) {
      return;
    }
    this.paramsGetPersonnel.page += 1;
    this.getListPersonnel();
  }

  handlerSelectPersonnel() {
    this.firstCall = true;
    this.getListMeetingSchedule();
  }

  handlerSearchPersonnel(event: string) {
    this.paramsGetPersonnel.page = 1;
    this.onSearchPersonnel.next(event);
  }

  handlerAddPersonnel(event: Event, schedule: IMeetingSchedule) {
    event.stopPropagation();
    if (this.isOpenDrawAddPersonnel) {
      return;
    }
    this.isOpenDrawAddPersonnel = true;
    this.drawerRefGlobal = this.drawerService.create<BmMeetingScheduleAddPersonnelComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '75vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: `Chi tiết lịch họp`,
      nzContent: BmMeetingScheduleAddPersonnelComponent,
      nzContentParams: {
        meetingSchedule: schedule
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddPersonnel = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDrawAddPersonnel = false;
        this.drawerRefGlobal.close();
        if (schedule) {
          Object.assign(schedule, data);
          return;
        }
        this.listMeetingSchedule = [data, ...this.listMeetingSchedule];
      });
      this.drawerRefGlobal.getContentComponent().attendance.subscribe((data) => {
        this.isOpenDrawAddPersonnel = false;
        this.drawerRefGlobal.close();
        setTimeout(() => {
          this.handlerAttendance({ stopPropagation: () => { } } as Event, data);
        }, 300);
      });
      this.drawerRefGlobal.getContentComponent().close.subscribe(() => {
        this.isOpenDrawAddPersonnel = false;
        this.drawerRefGlobal.close();
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddPersonnel = false;
      this.drawerRefGlobal.close();
    });
  }

  handlerAttendance(event: Event, meetingSchedule: IMeetingSchedule) {
    event.stopPropagation();
    if (this.isOpenDrawAttendance) {
      return;
    }
    this.isOpenDrawAttendance = true;
    this.drawerRefGlobal = this.drawerService.create<BmMeetingScheduleAttendanceComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '100vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: `Điểm danh`,
      nzContent: BmMeetingScheduleAttendanceComponent,
      nzContentParams: {
        meetingSchedule: meetingSchedule
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAttendance = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        Object.assign(meetingSchedule, data);
        this.keyFetch = uuid();
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAttendance = false;
      this.drawerRefGlobal.close();
    });
  }

  async handlerReSyncGoogleCalendar(event: Event, item: IMeetingSchedule) {
    event.stopPropagation();
    if (this.loadingReSyncGoogleCalendar) {
      return;
    }
    this.loadingReSyncGoogleCalendar = true;
    try {
      const result = await this.meetingScheduleService.updateMeetingSchedule(item);
      if (result.success) {
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      console.log(error);
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loadingReSyncGoogleCalendar = false;
    }
  }

  ngOnDestroy(): void {
    this.intervalSub.unsubscribe();
  }
}
