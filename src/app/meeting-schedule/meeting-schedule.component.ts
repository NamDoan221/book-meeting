import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from '../lib/services/auth/auth.service';
import { IMeetingSchedule, IParamsGetListMeetingSchedule } from '../lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { MeetingScheduleService } from '../lib/services/meeting-schedule/meting-schedule.service';
import { BmMeetingScheduleAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-meeting-schedule',
  templateUrl: './meeting-schedule.component.html',
  styleUrls: ['./meeting-schedule.component.scss']
})
export class BmMeetingScheduleComponent implements OnInit {

  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;

  loading: boolean;
  total: number;
  listMeetingSchedule: IMeetingSchedule[];
  firstCall: boolean;
  params: IParamsGetListMeetingSchedule;
  onSearch: Subject<string> = new Subject();

  constructor(
    private auth: AuthService,
    private drawerService: NzDrawerService,
    private notification: NzNotificationService,
    private meetingScheduleService: MeetingScheduleService
  ) {
    this.loading = false;
    this.total = 0;
    this.listMeetingSchedule = [];
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên cuộc họp',
      'Thời gian diễn ra',
      'Thời lượng dự kiến',
      'Phòng họp',
      'Người quản lý cuộc họp',
      'Số người được tham gia',
      'Mô tả nội dung cuộc họp',
      'Trạng thái'
    ];
    this.params = {
      page: 1,
      pageSize: 20
    };
    this.firstCall = false;
  }

  ngOnInit(): void {
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

  onChange(result: Date): void {
    console.log('Selected Time: ', result);
    this.params.from = dayjs(result[0]).toISOString();
    this.params.to = dayjs(result[1]).toISOString();
    this.getListMeetingSchedule();
  }

  onOk(result: Date | Date[] | null): void {
    console.log('onOk', result);
  }

  onCalendarChange(result: Array<Date | null>): void {
    console.log('onCalendarChange', result);
  }

  handlerAddMeetingSchedule(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditMeetingSchedule(event: Event, item: any) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(schedule: any) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
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
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (schedule) {
          Object.assign(schedule, data);
          return;
        }
        this.listMeetingSchedule = [data, ...this.listMeetingSchedule];
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDraw = false;
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

}
