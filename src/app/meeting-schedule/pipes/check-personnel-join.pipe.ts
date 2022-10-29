import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';

@Pipe({ name: 'CheckPersonnelJoinMeetingSchedulePipe' })
export class CheckPersonnelJoinMeetingSchedulePipe implements PipeTransform {
  transform(personnelId: string, listPersonnelJoin: IPersonnel[]) {
    if (!personnelId || !listPersonnelJoin?.length) {
      return false;
    }
    return !!listPersonnelJoin.find(item => item.Id === personnelId);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckPersonnelJoinMeetingSchedulePipe],
  exports: [CheckPersonnelJoinMeetingSchedulePipe]
})

export class CheckPersonnelJoinMeetingSchedulePipeModule { }
