import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';

@Pipe({ name: 'CheckStatusMeetingSchedulePipe' })
export class CheckStatusMeetingSchedulePipe implements PipeTransform {
  transform(timeStart: string, timeEnd: string, duration: number) {
    const compareTimeStartWithNow = dayjs(timeStart).diff(dayjs(), 'minute', false);
    const compareTimeEndWithNow = dayjs(timeEnd).diff(dayjs(), 'minute', false);
    console.log(compareTimeStartWithNow, compareTimeEndWithNow, duration);

    if (compareTimeStartWithNow > 0 && compareTimeStartWithNow > duration) {
      return `Sự kiên này sẽ diễn ra lúc ${dayjs(timeStart).format('HH:mm DD/MM/YYYY')} và kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeStartWithNow > 0 && compareTimeStartWithNow <= duration) {
      const day = dayjs(timeStart).diff(dayjs(), 'day', false);
      const hour = dayjs(timeStart).diff(dayjs(), 'hour', false);
      const text = day > 0 ? `${day} ngày` : hour > 0 ? `${hour} giờ` : `${compareTimeStartWithNow} phút`
      return `Sự kiên này đã diễn ra ${text} trước và sẽ kết thúc vào lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    if (compareTimeEndWithNow < 0) {
      const day = dayjs(dayjs()).diff(timeEnd, 'day', false);
      const hour = dayjs(dayjs()).diff(timeEnd, 'hour', false);
      const text = day > 0 ? `${day} ngày` : hour > 0 ? `${hour} giờ` : `${compareTimeEndWithNow} phút`
      return `Sự kiên này đã kết thúc ${text} trước lúc ${dayjs(timeEnd).format('HH:mm DD/MM/YYYY')}`;
    }
    return dayjs(timeStart).format('DD/MM/YYYY HH:mm');
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckStatusMeetingSchedulePipe],
  exports: [CheckStatusMeetingSchedulePipe]
})

export class CheckStatusMeetingSchedulePipeModule { }
