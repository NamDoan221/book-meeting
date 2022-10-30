import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as dayjs from 'dayjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from 'src/app/lib/services/department/interfaces/department.interface';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meting-schedule.service';
import { IParamsGetListPersonnelFreeTime, IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';
import { IParamsGetListPosition, IPosition } from 'src/app/lib/services/position/interfaces/position.interface';
import { PositionService } from 'src/app/lib/services/position/position.service';

@Component({
  selector: 'bm-meeting-schedule-add_personnel',
  templateUrl: './add-personnel.component.html'
})
export class BmMeetingScheduleAddPersonnelComponent implements OnInit {

  loading: boolean;
  listPersonnelJoin: IPersonnel[];
  disableChangePersonnelJoin: boolean;
  modeAdd: boolean;

  totalPersonnel: number;
  listPersonnel: IPersonnel[];
  onSearchPersonnel: Subject<string> = new Subject();
  paramsGetPersonnel: IParamsGetListPersonnelFreeTime;
  loadingPersonnel: boolean;
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

  @Input() meetingSchedule: IMeetingSchedule;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();

  constructor(
    private personnelService: PersonnelService,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService,
    private departmentService: DepartmentService,
    private positionService: PositionService
  ) {
    this.modeAdd = false;
    this.listPersonnelJoin = [];
    this.loading = false;

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
    this.disableChangePersonnelJoin = false;

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
  }

  async ngOnInit(): Promise<void> {
    if (this.meetingSchedule &&
      (dayjs(this.meetingSchedule.EstEndTime).utc().diff(dayjs().utc(), 'minute', false) > 0 && dayjs(this.meetingSchedule.EstStartTime).utc().diff(dayjs().utc(), 'minute', false) < 0) ||
      dayjs(this.meetingSchedule.EstEndTime).utc().diff(dayjs().utc(), 'minute', false) < 0 ||
      this.meetingSchedule.StatusCode !== 'MS_DEFAULT') {
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

  searchDetail(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetDetail.search : (this.paramsGetDetail.search = text);
    this.listPersonnelJoin = [];
    this.getDetailMeetingSchedule();
  }

  async getDetailMeetingSchedule() {
    this.loadingDetail = true;
    try {
      const result = await this.meetingScheduleService.getDetailMeetingSchedule(this.meetingSchedule.Id, this.paramsGetDetail);
      this.listPersonnelJoin = result.Value;
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

  handlerAddPersonnelToMeetingSchedule(event: boolean, personnel: IPersonnel) {
    if (event) {
      this.handlerUpdate(personnel);
      this.listPersonnelJoin = [...this.listPersonnelJoin, personnel];
      return;
    }
    this.handlerDelete(personnel.Id);
    this.listPersonnelJoin = this.listPersonnelJoin.filter(item => item.IdAccount !== personnel.IdAccount);
  }

  handlerRemovePersonnelJoin(event: Event, personnel: IPersonnel) {
    event.stopPropagation();
    this.handlerDelete(personnel.Id);
    this.listPersonnelJoin = this.listPersonnelJoin.filter(item => item.IdAccount !== personnel.IdAccount);
  }

  async handlerDelete(id: string) {
    try {
      this.loading = true;
      const result = await this.meetingScheduleService.deletePersonnelInMeetingSchedule(id);
      if (result.success) {
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

  async handlerUpdate(personnel: IPersonnel) {
    try {
      this.loading = true;
      const result = await this.meetingScheduleService.addPersonnelToMeetingSchedule({ idMeetingSchedule: this.meetingSchedule.Id, idAccount: personnel.IdAccount });
      if (result.success) {
        personnel.Id = result.result;
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
}
