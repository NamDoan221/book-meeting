import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { IDataItemGetByTypeDictionary } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/metting-schedule.interface';
import { IParamsGetListPersonnelFreeTime, IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';

@Component({
  selector: 'bm-meeting-schedule-dynamic_field',
  templateUrl: './dynamic-field.component.html'
})
export class BmMeetingScheduleDynamicFieldComponent implements OnInit {

  totalPersonnel: number;
  listPersonnel: IPersonnel[];
  onSearchPersonnel: Subject<string> = new Subject();
  paramsGetPersonnel: IParamsGetListPersonnelFreeTime;
  loadingPersonnel: boolean;
  firstCallPersonnel: boolean;

  @Input() meetingSchedule: IMeetingSchedule;
  @Input() item: IDataItemGetByTypeDictionary;
  @Input() formGroup: FormGroup;
  @Input() ignoreMargin: boolean;

  constructor(
    private personnelService: PersonnelService
  ) {

    this.listPersonnel = [];
    this.paramsGetPersonnel = {
      page: 1,
      pageSize: 20,
      from: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs().add(5, 'day').format('YYYY-MM-DDTHH:mm:ss'),
      search: ''
    }
    this.loadingPersonnel = true;
    this.firstCallPersonnel = true;
  }

  ngOnInit(): void {
    this.initData();
    this.onSearchPersonnel.pipe(debounceTime(500), filter(value => value !== this.paramsGetPersonnel.search)).subscribe((value) => {
      this.searchPersonnel(value);
    });
    this.getListPersonnel();
  }

  initData() {
    if (this.meetingSchedule?.EstStartTime) {
      this.paramsGetPersonnel.from = dayjs(this.meetingSchedule.EstStartTime).format('YYYY-MM-DDTHH:mm:ss')
    }
    if (this.meetingSchedule?.EstEndTime) {
      this.paramsGetPersonnel.to = dayjs(this.meetingSchedule.EstEndTime).format('YYYY-MM-DDTHH:mm:ss')
    }
  }


  handlerSearchPersonnel(event: string) {
    this.paramsGetPersonnel.page = 1;
    this.onSearchPersonnel.next(event);
  }

  handlerScrollPersonnel(event: any) {
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
      this.listPersonnel = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPersonnel = false;
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

  handlerScrollBottomPersonnel() {
    if (this.loadingPersonnel || !this.totalPersonnel || this.totalPersonnel <= this.listPersonnel.length) {
      return;
    }
    this.paramsGetPersonnel.page += 1;
    this.getListPersonnel();
  }
}
