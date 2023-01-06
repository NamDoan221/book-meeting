import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';

@Pipe({ name: 'GetPersonnelPipe' })
export class GetPersonnelPipe implements PipeTransform {
  transform(personnelId: string, listPersonnelJoin: IPersonnel[]) {
    return listPersonnelJoin.find(item => item.IdAccount === personnelId);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [GetPersonnelPipe],
  exports: [GetPersonnelPipe]
})

export class GetPersonnelPipeModule { }
