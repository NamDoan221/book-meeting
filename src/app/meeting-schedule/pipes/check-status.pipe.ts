import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';

@Pipe({ name: 'CheckStatusMeetingSchedulePipe' })
export class CheckStatusMeetingSchedulePipe implements PipeTransform {
  transform(item: IMeetingSchedule, timeEnd: string, duration: number, keyFetch: string, tag: boolean = false) {
    const compareTimeStartWithNow = dayjs(item.EstStartTime).diff(dayjs(), 'minute', false);
    const compareTimeEndWithNow = dayjs(timeEnd).diff(dayjs(), 'minute', false);
    if (item.StatusCode === 'MS_COMPLETED') {
      return tag ? 3 : `Sự kiện này đã kết thúc ${this.buildText(item.StartTime, dayjs(), 0)} trước lúc ${dayjs(item.EndTime).format('HH:mm DD/MM/YYYY')}`;
    }
    if (item.StatusCode === 'MS_STARTED') {
      return tag ? 2 : `Sự kiện này đã diễn ra ${this.buildText(item.StartTime, dayjs(), 0)} trước và sẽ kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeStartWithNow > 0) {
      return tag ? 1 : `Sự kiện này sẽ diễn ra lúc ${dayjs(item.EstStartTime).format('HH:mm DD/MM/YYYY')} và kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeStartWithNow <= 0 && -compareTimeStartWithNow <= duration) {
      return tag ? 2 : `Sự kiện này đã diễn ra ${this.buildText(item.EstStartTime, dayjs(), compareTimeStartWithNow)} trước và sẽ kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeEndWithNow < 0) {
      return tag ? 3 : `Sự kiện này đã kết thúc ${this.buildText(dayjs(), timeEnd, compareTimeEndWithNow)} trước lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    return tag ? 4 : dayjs(item.EstStartTime).format('DD/MM/YYYY HH:mm');
  }

  buildText(startTime: any, endTime: any, minute: number) {
    let year = dayjs(startTime).diff(endTime, 'year', false);
    let month = dayjs(startTime).diff(endTime, 'month', false);
    let day = dayjs(startTime).diff(endTime, 'day', false);
    let hour = dayjs(startTime).diff(endTime, 'hour', false);
    let minute1 = minute || dayjs(startTime).diff(endTime, 'minutes', false);
    if (minute1 < 0) {
      year = -year;
      month = -month;
      day = -day;
      hour = -hour;
    };
    const text = year > 0 ? `${year} năm` : month > 0 ? `${month} tháng` : day > 0 ? `${day} ngày` : hour > 0 ? `${hour} giờ` : `${-minute1} phút`;
    return text;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckStatusMeetingSchedulePipe],
  exports: [CheckStatusMeetingSchedulePipe]
})

export class CheckStatusMeetingSchedulePipeModule { }
