import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';
import { IMeetingSchedule } from 'src/app/lib/services/meeting-schedule/interfaces/meeting-schedule.interface';

@Pipe({ name: 'CheckCanAttendanceMeetingSchedulePipe' })
export class CheckCanAttendanceMeetingSchedulePipe implements PipeTransform {
  transform(item: IMeetingSchedule, duration: number, keyFetch: string) {
    if (item.StatusCode === 'MS_COMPLETED') {
      return false;
    }
    const compareTimeWithNow = dayjs(item.EstStartTime).diff(dayjs(), 'minute', false);
    if (compareTimeWithNow >= 0) {
      return true;
    }
    if (compareTimeWithNow < 0) {
      if (-compareTimeWithNow > duration) {
        return false;
      }
      return true;
    }
    return false;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckCanAttendanceMeetingSchedulePipe],
  exports: [CheckCanAttendanceMeetingSchedulePipe]
})

export class CheckCanAttendanceMeetingSchedulePipeModule { }
