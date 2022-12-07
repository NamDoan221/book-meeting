import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDataItemGetByTypeDictionary } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';

@Pipe({ name: 'GetIgnorePersonnelPipe' })
export class GetIgnorePersonnelPipe implements PipeTransform {
  transform(item: IDataItemGetByTypeDictionary, dataGuest: IPersonnel[] = [], dataOther: IPersonnel[] = [], keyFetch: string) {
    const dataOtherNew = dataOther?.filter(element => element.IdAttendanceType !== item.Id);
    return [...dataGuest, ...dataOtherNew];
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [GetIgnorePersonnelPipe],
  exports: [GetIgnorePersonnelPipe]
})

export class GetIgnorePersonnelPipeModule { }
