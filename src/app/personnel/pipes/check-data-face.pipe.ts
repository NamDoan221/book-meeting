import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataFaceService } from 'src/app/lib/services/dataface/dataface.service';

@Pipe({ name: 'CheckDataFacePersonnelPipe' })
export class CheckDataFacePersonnelPipe implements PipeTransform {
  constructor(private dataFaceService: DataFaceService) { }
  async transform(idAccount: string, keyFetch?: string) {
    try {
      const result = await this.dataFaceService.checkDataFace(idAccount);
      if (result.success) {
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
