import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';

@Pipe({ name: 'CheckPersonnelGuestMeetingSchedulePipe' })
export class CheckPersonnelGuestMeetingSchedulePipe implements PipeTransform {
  transform(listPersonnel: IPersonnel[], listPersonnelJoin: IPersonnel[], search: string = '', inList: boolean = false) {
    if (!listPersonnel?.length) {
      return [];
    }
    if (inList) {
      if (!search) {
        return listPersonnel;
      }
      return listPersonnel.filter(item => listPersonnelJoin?.find(ele => ele.IdAccount === item.IdAccount));
    }
    return listPersonnel.filter(item => !listPersonnelJoin?.find(ele => ele.IdAccount === item.IdAccount));
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckPersonnelGuestMeetingSchedulePipe],
  exports: [CheckPersonnelGuestMeetingSchedulePipe]
})

export class CheckPersonnelGuestMeetingSchedulePipeModule { }
