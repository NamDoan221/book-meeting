import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';

@Pipe({ name: 'CheckAttendancePipe' })
export class CheckAttendancePipe implements PipeTransform {
  transform(detailId: string, listAttendance: string[], keyFetch: string) {
    if (!detailId || !listAttendance?.length) {
      return false;
    }
    return listAttendance.includes(detailId);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckAttendancePipe],
  exports: [CheckAttendancePipe]
})

export class CheckAttendancePipeModule { }
