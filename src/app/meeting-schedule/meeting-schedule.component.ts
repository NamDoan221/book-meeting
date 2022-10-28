import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from '../lib/services/auth/auth.service';
import { DepartmentService } from '../lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { IMeetingSchedule, IParamsGetListMeetingSchedule } from '../lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { MeetingScheduleService } from '../lib/services/meeting-schedule/meting-schedule.service';
import { IParamsGetListPersonnel, IPersonnel } from '../lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from '../lib/services/personnel/personnel.service';
import { BmMeetingScheduleAddEditComponent } from './add-edit/add-edit.component';
import { BmMeetingScheduleAddPersonnelComponent } from './add-personnel/add-personnel.component';

@Component({
  selector: 'bm-meeting-schedule',
  templateUrl: './meeting-schedule.component.html'
})
export class BmMeetingScheduleComponent implements OnInit {

  columnConfig: string[];
  isOpenDrawAddEdit: boolean;
  isOpenDrawAddPersonnel: boolean;
  drawerRefGlobal: NzDrawerRef;

  loading: boolean;
  total: number;
  listMeetingSchedule: IMeetingSchedule[];
  firstCall: boolean;
  params: IParamsGetListMeetingSchedule;
  onSearch: Subject<string> = new Subject();
  defaultFilterTime: string[];

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

  constructor(
    private auth: AuthService,
    private drawerService: NzDrawerService,
    private notification: NzNotificationService,
    private departmentService: DepartmentService,
    private meetingScheduleService: MeetingScheduleService,
    private personnelService: PersonnelService
  ) {
    this.loading = false;
    this.total = 0;
    this.listMeetingSchedule = [];
    this.isOpenDrawAddEdit = false;
    this.isOpenDrawAddPersonnel = false;
    this.columnConfig = [
      'Tên cuộc họp',
      'Thời gian diễn ra',
      'Thời lượng dự kiến',
      'Phòng họp',
      'Người quản lý cuộc họp',
      'Phòng ban',
      'Số người được tham gia',
      'Mô tả nội dung cuộc họp',
      'Trạng thái'
    ];
    this.defaultFilterTime = [dayjs().subtract(30, 'day').toISOString(), dayjs().toISOString()];
    this.params = {
      page: 1,
      pageSize: 20,
      from: this.defaultFilterTime[0],
      to: this.defaultFilterTime[1]
    };
    this.firstCall = false;

    this.totalDepartment = 0;
    this.listDepartment = [];
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 20,
      active: true
    }
    this.loadingDepartment = true;
    this.firstCallDepartment = true;

    this.totalPersonnel = 0;
    this.listPersonnel = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 20,
      active: true
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchMeetingSchedule(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.onSearchPersonnel.pipe(debounceTime(500), filter(value => value !== this.paramsGetPersonnel.search)).subscribe((value) => {
      this.searchPersonnel(value);
    });
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
      const result = await this.meetingScheduleService.getListMeetingSchedule(this.params);
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

  onFilterTimeChange(result: Date): void {
    this.params.from = dayjs(result[0]).toISOString();
    this.params.to = dayjs(result[1]).toISOString();
    this.getListMeetingSchedule();
  }

  handlerAddMeetingSchedule(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditMeetingSchedule(event: Event, item: any) {
    event.stopPropagation();
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
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: schedule ? `Sửa lịch họp` : 'Thêm lịch họp',
      nzContent: BmMeetingScheduleAddEditComponent,
      nzContentParams: {
        meetingSchedule: schedule,
        modeEdit: schedule ? true : false
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
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal.close();
    });
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params) {
      return;
    }
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

  handlerSelectDepartment() {
    this.firstCall = true;
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
        meetingSchedule: schedule,
        modeEdit: schedule ? true : false
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
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddPersonnel = false;
      this.drawerRefGlobal.close();
    });
  }
}
