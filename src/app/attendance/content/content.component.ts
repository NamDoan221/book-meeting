import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as dayjs from 'dayjs';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { IMeetingSchedule, IParamsGetListMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';
import { MeetingScheduleService } from 'src/app/lib/services/meeting-schedule/meeting-schedule.service';

@Component({
  selector: 'bm-meeting-schedule-content',
  templateUrl: './content.component.html'
})
export class BmMeetingAttendanceContentComponent implements OnInit {

  meetingScheduleForm: FormGroup;
  listPosition: any[];
  loading: boolean;
  listPersonnel: any[];
  listMemberSelected: any[];
  pageSize: number;
  pageIndexGroup: number;
  columnConfig: string[];
  modeEdit: boolean;
  meetingSchedule: any;
  modeStartCam: boolean;

  total: number;
  listMeetingSchedule: IMeetingSchedule[];
  firstCall: boolean;
  params: IParamsGetListMeetingSchedule;
  onSearch: Subject<string> = new Subject();

  @Input() attendanceId: string[];
  @Input() keyFetch: string[];

  @Output() loadDataTrainComplete = new EventEmitter<any[]>();
  @Output() saveSuccess = new EventEmitter<any>();
  @Output() startAttendance = new EventEmitter<string>();
  @Output() stopAttendance = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private meetingScheduleService: MeetingScheduleService,
    private authService: AuthService
  ) {
    this.modeStartCam = false;
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
    this.columnConfig = [
      'Tên nhân viên',
      'Trạng thái điểm danh',
    ];
    this.listMeetingSchedule = [];
    this.params = {
      page: 1,
      pageSize: 20,
      status: 'MS_DEFAULT',
      from: dayjs().subtract(5, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs().add(10, 'month').format('YYYY-MM-DDTHH:mm:ss'),
      search: '',
      idCreator: this.authService.decodeToken().Id
    };
    this.attendanceId = [];
  }

  ngOnInit(): void {
    this.meetingScheduleForm = this.fb.group({
      meetingSchedule: ['', [Validators.required]]
    });
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchMeetingSchedule(value);
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
      const result = await this.meetingScheduleService.getListMeetingScheduleCreator(this.params);
      this.total = result.Total;
      this.listMeetingSchedule = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerSearchMeetingSchedule(event: string) {
    this.params.page = 1;
    this.onSearch.next(event);
  }

  handlerScrollBottom(event: any) {

  }

  handlerChangeMember(event) {
    this.listMemberSelected = event;
  }

  async handlerChooseMeetingSchedule(event: string) {
    try {
      const result = await this.meetingScheduleService.getDetailAttendanceMeetingSchedule(event);
      this.listPersonnel = result.Value;
      const dataTrain = [...(result.Value ?? [])].map(item => {
        return {
          label: {
            Id: item.Id,
            FullName: item.FullName
          },
          descriptors: JSON.parse(item.DataTrain)
        }
      })
      this.loadDataTrainComplete.emit(dataTrain);
    } catch (error) {
      console.log(error);
    }
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

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params) {
      return;
    }
    this.pageIndexGroup = params.pageIndex;
    this.pageSize = params.pageSize;
    let param = {
      page: this.pageIndexGroup,
      limit: this.pageSize
    }
    // this.getListMeetingRoom(param);
  }

  handlerStart(event: Event) {
    event.stopPropagation();
    if (!this.modeStartCam) {
      if (!this.meetingScheduleForm.valid) {
        Object.values(this.meetingScheduleForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }
      this.startAttendance.emit(this.meetingScheduleForm.value.meetingSchedule);
      this.modeStartCam = !this.modeStartCam;
      return;
    }
    this.modeStartCam = !this.modeStartCam;
    this.stopAttendance.emit();
  }

}
