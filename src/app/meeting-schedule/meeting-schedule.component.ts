import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from '../lib/services/auth.service';
import { BmMeetingScheduleAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-meeting-schedule',
  templateUrl: './meeting-schedule.component.html',
  styleUrls: ['./meeting-schedule.component.scss']
})
export class BmMeetingScheduleComponent implements OnInit {

  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listMeetingSchedule: any[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;

  constructor(
    private auth: AuthService,
    private drawerService: NzDrawerService,
    private notification: NzNotificationService
  ) {
    this.loading = false;
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
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
  }

  ngOnInit(): void {
  }

  getListMeetingRoom(params: any) {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Meet ${i}`,
        start_time: '07/20/2022 13:30',
        estimated_duration: '30',
        meeting_room: `Room ${i}`,
        meeting_manager: `Nhan su ${i}`,
        participants: [i + 1],
        description: `Meet mo ta ${i}`,
        status: 'Chưa diễn ra'
      });
    }
    this.listMeetingSchedule = data;
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
      nzWidth: '50vw',
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
    this.pageIndexGroup = params.pageIndex;
    this.pageSize = params.pageSize;
    let param = {
      page: this.pageIndexGroup,
      limit: this.pageSize
    }
    this.getListMeetingRoom(param);
  }

}
