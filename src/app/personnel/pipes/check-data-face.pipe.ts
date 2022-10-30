import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataFaceService } from 'src/app/lib/services/dataface/dataface.service';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';

@Pipe({ name: 'CheckDataFacePersonnelPipe' })
export class CheckDataFacePersonnelPipe implements PipeTransform {
  constructor(private dataFaceService: DataFaceService) { }
  async transform(personnel: IPersonnel, keyFetch?: string) {
    if (personnel.SpecificHasFace) {
      return true;
    }
    try {
      const result = await this.dataFaceService.checkDataFace(personnel.Id);
      if (result.success) {
        personnel.SpecificHasFace = true;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [CheckDataFacePersonnelPipe],
  exports: [CheckDataFacePersonnelPipe]
})

export class CheckDataFacePersonnelPipeModule { }
