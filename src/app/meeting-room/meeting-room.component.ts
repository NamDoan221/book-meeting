import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { ITab } from '../lib/interfaces/tab.interface';
import { IParamsGetListRoom, IRoom } from '../lib/services/room/interfaces/room.interface';
import { RoomService } from '../lib/services/room/room.service';
import { BmMeetingRoomAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-meeting-room',
  templateUrl: './meeting-room.component.html'
})
export class BmMeetingRoomComponent implements OnInit {

  firstCall: boolean;
  loading: boolean;
  total: number;
  listMeetingRoom: IRoom[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  params: IParamsGetListRoom;
  keyToggleLoading: string;
  tabs: ITab[];
  selectedTab: number;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  constructor(
    private drawerService: NzDrawerService,
    private roomService: RoomService,
    private nzMessageService: NzMessageService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.total = 0;
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên phòng họp',
      'Mã phòng họp',
      'Sức chứa tối đa',
      'Mô tả',
      'Trạng thái'
    ];
    this.params = {
      page: 1,
      pageSize: 20,
      active: true
    };
    this.selectedTab = 0;
    this.tabs = TabsDefault();
    this.showDelete = false;
    this.checked = false;
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchMeetingRoom(value);
    });
    this.getListMeetingRoom();
  }

  searchMeetingRoom(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listMeetingRoom = [];
    this.firstCall = true;
    this.getListMeetingRoom();
  }

  async getListMeetingRoom() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const result = await this.roomService.getListRoom(this.params);
      this.listMeetingRoom = result.Value;
      this.total = result.Total;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddMeetingRoom(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditMeetingRoom(event: Event, item: IRoom) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(room: IRoom) {
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

  handlerKeyUp(event) {
    if (this.params.search === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchMeetingRoom(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListMeetingRoom();
  }

  async handlerActiveChange(event: boolean, item: IRoom) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.roomService.changeStatusRoom(item.Id);
      if (result.success) {
        item.Active = event;
        this.listMeetingRoom = this.listMeetingRoom.filter(element => element.Id !== item.Id)
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      item.Active = !event;
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
      item.Active = !event;
    } finally {
      this.keyToggleLoading = undefined;
    }
  }

  handlerTabChange(event) {
    this.selectedTab = event.index;
    this.params.active = event.index === 0;
    this.firstCall = true;
    this.getListMeetingRoom();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    if (this.setOfCheckedId.size > 0) {
      this.showDelete = true;
      return;
    }
    this.showDelete = false;
  }

  handlerDeleteMeetingRoom(event: Event) {
    event.stopPropagation();
    console.log(this.setOfCheckedId);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.Id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange(event: readonly any[]): void {
    this.listOfCurrentPageData = event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.Id));
  }
}
