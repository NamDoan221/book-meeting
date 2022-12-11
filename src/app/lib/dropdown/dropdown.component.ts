import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { IDataItemGetByTypeDictionary } from '../services/dictionary/interfaces/dictionary.interface';
import { IMeetingRoom, IParamsGetListMeetingRoomFreeTime } from '../services/meeting-room/interfaces/room.interface';
import { MeetingRoomService } from '../services/meeting-room/meeting-room.service';
import { IMeetingSchedule } from '../services/meeting-schedule/interfaces/meeting-schedule.interface';

@Component({
  selector: 'bm-lib-dropdown',
  templateUrl: './dropdown.component.html'
})
export class BmLibDropDownComponent implements OnInit {

  totalMeetingRoom: number;
  listMeetingRoom: IMeetingRoom[];
  onSearchMeetingRoom: Subject<string> = new Subject();
  paramsGetMeetingRoom: IParamsGetListMeetingRoomFreeTime;
  loadingMeetingRoom: boolean;
  firstCallMeetingRoom: boolean;

  @Input() meetingSchedule: IMeetingSchedule;
  @Input() formGroup: FormGroup;
  @Input() formControlName: string;

  @Output() selectedChange = new EventEmitter<string>();

  constructor(
    private meetingRoomService: MeetingRoomService
  ) {
    this.listMeetingRoom = [];
    this.paramsGetMeetingRoom = {
      page: 1,
      pageSize: 20,
      search: '',
      from: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm:ss'),
      active: true
    }
    this.loadingMeetingRoom = true;
    this.firstCallMeetingRoom = true;
    this.formControlName = 'IdRoom';
  }

  ngOnInit() {
    if (this.meetingSchedule?.EstStartTime) {
      this.paramsGetMeetingRoom.from = dayjs(this.meetingSchedule.EstStartTime).format('YYYY-MM-DDTHH:mm:ss');
    }
    if (this.meetingSchedule?.EstEndTime) {
      this.paramsGetMeetingRoom.to = dayjs(this.meetingSchedule.EstEndTime).format('YYYY-MM-DDTHH:mm:ss');
    }
    this.onSearchMeetingRoom.pipe(debounceTime(500), filter(value => value !== this.paramsGetMeetingRoom.search)).subscribe((value) => {
      this.searchMeetingRoom(value);
    });
    this.getListMeetingRoom();
  }

  handlerSearchMeetingRoom(event: string) {
    this.paramsGetMeetingRoom.page = 1;
    this.onSearchMeetingRoom.next(event);
  }

  handlerScrollBottomMeetingRoom() {
    if (this.loadingMeetingRoom || !this.totalMeetingRoom || this.totalMeetingRoom <= this.listMeetingRoom.length) {
      return;
    }
    this.paramsGetMeetingRoom.page += 1;
    this.getListMeetingRoom();
  }

  searchMeetingRoom(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetMeetingRoom.search : (this.paramsGetMeetingRoom.search = text);
    this.listMeetingRoom = [];
    this.getListMeetingRoom();
  }

  async getListMeetingRoom() {
    if (this.loadingMeetingRoom && !this.firstCallMeetingRoom) {
      return;
    }
    this.firstCallMeetingRoom = false;
    try {
      this.loadingMeetingRoom = true;
      const result = await this.meetingRoomService.getListMeetingRoomFreeTime(this.paramsGetMeetingRoom);
      this.totalMeetingRoom = result.Total;
      this.listMeetingRoom.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingMeetingRoom = false;
    }
  }

  handlerChangeSelected(event: string) {
    const roomName = this.listMeetingRoom.find(item => item.Id === event)?.Name;
    this.selectedChange.emit(roomName);
  }

}
