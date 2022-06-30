import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from '../lib/services/auth.service';
import { BmMeetingRoomAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-meeting-room',
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss']
})
export class BmMeetingRoomComponent implements OnInit {

  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listMeetingRoom: any[];
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
      'Tên phòng họp',
      'Sức chứa tối đa',
      'Mô tả'
    ];
  }

  ngOnInit(): void {
  }

  getListMeetingRoom(params: any) {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Meet ${i}`,
        maximum_capacity: i + 1,
        description: `Meet mo ta ${i}`
      });
    }
    this.listMeetingRoom = data;
  }

  handlerAddMeetingRoom(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditMeetingRoom(event: Event, item: any) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(room: any) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmMeetingRoomAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: room ? `Sửa phòng họp` : 'Thêm phòng họp',
      nzContent: BmMeetingRoomAddEditComponent,
      nzContentParams: {
        room: room,
        modeEdit: room ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (room) {
          Object.assign(room, data);
          return;
        }
        this.listMeetingRoom = [data, ...this.listMeetingRoom];
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
