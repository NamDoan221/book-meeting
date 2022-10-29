import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meting-schedule.service';
import { IParamsGetListPersonnel, IParamsGetListPersonnelFreeTime, IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';

@Component({
  selector: 'bm-meeting-schedule-add_personnel',
  templateUrl: './add-personnel.component.html'
})
export class BmMeetingScheduleAddPersonnelComponent implements OnInit {

  meetingScheduleForm: FormGroup;
  listPosition: any[];
  loading: boolean;
  listPersonnelJoin: IPersonnel[];
  disableChangePersonnelJoin: boolean;

  totalPersonnel: number;
  listPersonnel: IPersonnel[];
  onSearchPersonnel: Subject<string> = new Subject();
  paramsGetPersonnel: IParamsGetListPersonnelFreeTime;
  loadingPersonnel: boolean;
  firstCallPersonnel: boolean;

  @Input() meetingSchedule: IMeetingSchedule;
  @Input() modeEdit: boolean;

  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;

  @Output() saveSuccess = new EventEmitter<IMeetingSchedule>();

  constructor(
    private fb: FormBuilder,
    private personnelService: PersonnelService,
    private meetingScheduleService: MeetingScheduleService,
    private nzMessageService: NzMessageService,
    private authService: AuthService
  ) {
    this.listPersonnelJoin = [];
    this.loading = false;

    this.listPersonnel = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 20,
      from: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      to: dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm:ss[Z]'),
      search: ''
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;
    this.disableChangePersonnelJoin = false;
  }

  ngOnInit(): void {
    if (this.meetingSchedule && (dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) > 0 && dayjs(this.meetingSchedule.EstStartTime).diff(dayjs(), 'minute', false) < 0) || dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) < 0) {
      this.disableChangePersonnelJoin = true;
    }
    this.onSearchPersonnel.pipe(debounceTime(500), filter(value => value !== this.paramsGetPersonnel.search)).subscribe((value) => {
      this.searchPersonnel(value);
    });
    this.getListPersonnel();
    this.getDetailMeetingSchedule();
  }

  async getDetailMeetingSchedule() {
    try {
      const result = await this.meetingScheduleService.getDetailMeetingSchedule(this.meetingSchedule.Id);
      console.log(result);

    } catch (error) {
      console.log(error);
    }
  }

  handlerKeyUp(event) {

  }

  handlerSearchPersonnel(event: string) {
    this.paramsGetPersonnel.page = 1;
    this.onSearchPersonnel.next(event);
  }

  handlerScrollBottomPersonnel() {
    if (this.loadingPersonnel || !this.totalPersonnel || this.totalPersonnel <= this.listPersonnel.length) {
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
      this.listPersonnel.push(...result.Value);
      console.log(this.listPersonnel);

    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPersonnel = false;
    }
  }

  handlerScrollBottom(event) {

  }

  handlerAddPersonnelToMeetingSchedule(event: boolean, personnel: IPersonnel, index: number) {
    if (event) {
      this.listPersonnelJoin.push(personnel);
      return;
    }
    this.listPersonnelJoin.splice(index, 1);
  }

  handlerRemovePersonnelJoin(event: Event, index: number) {
    event.stopPropagation();
    this.listPersonnelJoin.splice(index, 1);
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
      EstEndTime: dayjs(this.meetingScheduleForm.value.EstStartTime).add(this.meetingScheduleForm.value.EstStartTime.EstDuration, 'minute'),
      IdCreator: this.meetingSchedule.IdCreator ?? this.authService.decodeToken().Id
    }
    if (this.modeEdit) {
      body.Id = this.meetingSchedule.Id;
    }
    try {
      const result = await this.meetingScheduleService[this.modeEdit ? 'updateMeetingSchedule' : 'createMeetingSchedule'](body);
      // if (result.success) {
      //   const creatorName = this.authService.decodeToken().FullName;
      //   const creatorPosition = this.authService.decodeToken().PositionName;
      //   const departmentName = this.authService.decodeToken().DepartmentName;
      //   const roomName = this.listPersonnel.find(item => item.Id === body.IdRoom)?.Name;
      //   this.saveSuccess.emit({ ...body, Id: result.result ?? this.meetingSchedule.Id, CreatorName: creatorName, RoomName: roomName, CreatorPosition: creatorPosition, DepartmentName: departmentName });
      //   this.nzMessageService.success('Thao tác thành công.');
      //   return;
      // }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }

    this.saveSuccess.emit(this.meetingScheduleForm.value);
  }

}
