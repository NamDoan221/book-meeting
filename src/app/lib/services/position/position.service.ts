import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IPosition, IParamsGetListPosition } from './interfaces/position.interface';

@Injectable({
  providedIn: 'root',
})
export class PositionService extends BaseService {

  constructor() {
    super();
  }

  public getListPosition(params: IParamsGetListPosition): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Position`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createPosition(body: IPosition): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Position`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updatePosition(body: IPosition): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Position/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeStatusPosition(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Position/${id}/toggle`, undefined).subscribe({
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
