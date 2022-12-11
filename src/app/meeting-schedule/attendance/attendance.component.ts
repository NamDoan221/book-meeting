import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as dayjs from 'dayjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meeting-schedule.service';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';
import { PositionService } from 'src/app/lib/services/position/position.service';
import * as uuid from 'uuid';

@Component({
  selector: 'bm-meeting-schedule-attendance',
  templateUrl: './attendance.component.html'
})
export class BmMeetingScheduleAttendanceComponent implements OnInit {

  modeAttendance: boolean;
  loading: boolean;
  listPersonnelJoin: IPersonnel[];
  disableChangePersonnelJoin: boolean;
  modeAdd: boolean;
  keyFetch: string;
  loadingDetail: boolean;
  firstCallDetail: boolean;

  @Input() meetingSchedule: IMeetingSchedule;

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
    this.disableChangePersonnelJoin = false;
  }

  async ngOnInit(): Promise<void> {
    if (this.meetingSchedule &&
      (dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) > 0 && dayjs(this.meetingSchedule.EstStartTime).diff(dayjs(), 'minute', false) < 0) ||
      dayjs(this.meetingSchedule.EstEndTime).diff(dayjs(), 'minute', false) < 0 ||
      this.meetingSchedule.StatusCode !== 'MS_DEFAULT') {
      this.disableChangePersonnelJoin = true;
    }
    this.getDetailAttendanceMeetingSchedule();
  }

  async getDetailAttendanceMeetingSchedule() {
    this.loadingDetail = true;
    try {
      const result = await this.meetingScheduleService.getDetailAttendanceMeetingSchedule(this.meetingSchedule.Id);
      this.listPersonnelJoin = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingDetail = false;
    }
  }

  handlerChangeModeAdd(event: Event) {
    event.stopPropagation();
    this.modeAdd = true;
  }

  handlerBack(event: Event) {
    event.stopPropagation();
    this.modeAdd = false;
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
    this.keyFetch = uuid();
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
      const result = await this.meetingScheduleService.addPersonnelToMeetingSchedule({ IdMeetingSchedule: this.meetingSchedule.Id, IdAccount: personnel.IdAccount });
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
}
