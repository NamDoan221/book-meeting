import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';

@Pipe({ name: 'CheckCanAttendanceMeetingSchedulePipe' })
export class CheckCanAttendanceMeetingSchedulePipe implements PipeTransform {
  transform(timeStart: string, duration: number) {
    const compareTimeWithNow = dayjs(timeStart).diff(dayjs(), 'minute', false);
    if (compareTimeWithNow > 0) {
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
