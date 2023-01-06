import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root',
})
export class DataFaceService extends BaseService {

  constructor() {
    super();
  }

  public checkDataFace(idPersonnel: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Dataface/${idPersonnel}`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public addOrUpdateDataFace(idPersonnel: string, body: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postFormData(`${this.domain}/File/upload-data-face`, body, new HttpParams({ fromObject: { id: idPersonnel } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteDataFace(idPersonnel: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.delete(`${this.domain}/Dataface/${idPersonnel}`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }
}
