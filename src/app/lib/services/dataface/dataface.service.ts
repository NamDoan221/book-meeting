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
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public addOrUpdateDataFace(idPersonnel: string, body: { dataTrain: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Dataface/${idPersonnel}`, body).subscribe({
        next: result => {
          return resolve(result);
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
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }
}
