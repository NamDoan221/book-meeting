import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as dayjs from 'dayjs';

@Pipe({ name: 'CheckTimeStartMeetingSchedulePipe' })
export class CheckTimeStartMeetingSchedulePipe implements PipeTransform {
  transform(timeStart: string, message: boolean = false, icon: boolean = false) {
    const compareTimeWithNow = dayjs(timeStart).diff(dayjs(), 'minute', false);
    if (compareTimeWithNow < 30 && compareTimeWithNow > 0) {
      return message ? 'Sắp diễn ra' : icon ? 'clock-circle' : true;
    }
    if (compareTimeWithNow < 0) {
      return message ? 'Quá hạn' : icon ? 'close-circle' : true;
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
