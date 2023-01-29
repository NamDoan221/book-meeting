import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';

@Pipe({ name: 'CheckTimeStartMeetingSchedulePipe' })
export class CheckTimeStartMeetingSchedulePipe implements PipeTransform {
  transform(item: IMeetingSchedule, duration: number, keyFetch: string, message: boolean = false, icon: boolean = false, color: boolean = false) {
    const compareTimeWithNow = dayjs(item.EstStartTime).diff(dayjs(), 'minute', false);
    if (compareTimeWithNow < 30 && compareTimeWithNow > 0) {
      if (item.StatusCode === 'MS_COMPLETED') {
        return message ? 'Đã kết thúc' : icon ? 'check-circle' : color ? 'bm-color-6fd100' : true;
      }
      if (item.StatusCode === 'MS_STARTED') {
        return message ? 'Đang diễn ra' : icon ? 'pause-circle' : color ? 'bm-color-009cdb' : true;
      }
      return message ? 'Sắp diễn ra' : icon ? 'clock-circle' : color ? 'bm-color-ff5454' : true;
    }
    if (compareTimeWithNow <= 0) {
      if (-compareTimeWithNow > duration) {
        return message ? 'Đã kết thúc' : icon ? 'check-circle' : color ? 'bm-color-6fd100' : true;
      }
      if (item.StatusCode === 'MS_COMPLETED') {
        return message ? 'Đã kết thúc' : icon ? 'check-circle' : color ? 'bm-color-6fd100' : true;
      }
      return message ? 'Đang diễn ra' : icon ? 'pause-circle' : color ? 'bm-color-009cdb' : true;
    }
    return message ? '' : icon ? '' : false;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckTimeStartMeetingSchedulePipe],
  exports: [CheckTimeStartMeetingSchedulePipe]
})

export class CheckTimeStartMeetingSchedulePipeModule { }
