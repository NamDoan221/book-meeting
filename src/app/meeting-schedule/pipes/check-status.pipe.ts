import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';

@Pipe({ name: 'CheckStatusMeetingSchedulePipe' })
export class CheckStatusMeetingSchedulePipe implements PipeTransform {
  transform(timeStart: string, timeEnd: string, duration: number, keyFetch: string, tag: boolean = false) {
    const compareTimeStartWithNow = dayjs(timeStart).diff(dayjs(), 'minute', false);
    const compareTimeEndWithNow = dayjs(timeEnd).diff(dayjs(), 'minute', false);
    if (compareTimeStartWithNow > 0) {
      return tag ? 1 : `Sự kiện này sẽ diễn ra lúc ${dayjs(timeStart).format('HH:mm DD/MM/YYYY')} và kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeStartWithNow <= 0 && -compareTimeStartWithNow <= duration) {
      return tag ? 2 : `Sự kiện này đã diễn ra ${this.buildText(timeStart, dayjs(), compareTimeStartWithNow)} trước và sẽ kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeEndWithNow < 0) {
      return tag ? 3 : `Sự kiện này đã kết thúc ${this.buildText(dayjs(), timeEnd, compareTimeEndWithNow)} trước lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    return tag ? 4 : dayjs(timeStart).format('DD/MM/YYYY HH:mm');
  }

  buildText(startTime: any, endTime: any, minute: number) {
    let year = dayjs(startTime).diff(endTime, 'year', false);
    let month = dayjs(startTime).diff(endTime, 'month', false);
    let day = dayjs(startTime).diff(endTime, 'day', false);
    let hour = dayjs(startTime).diff(endTime, 'hour', false);
    if (minute < 0) {
      year = -year;
      month = -month;
      day = -day;
      hour = -hour;
    };
    const text = year > 0 ? `${year} năm` : month > 0 ? `${month} tháng` : day > 0 ? `${day} ngày` : hour > 0 ? `${hour} giờ` : `${-minute} phút`;
    return text;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckStatusMeetingSchedulePipe],
  exports: [CheckStatusMeetingSchedulePipe]
})

export class CheckStatusMeetingSchedulePipeModule { }
