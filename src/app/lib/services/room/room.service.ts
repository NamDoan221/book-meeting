import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IParamsGetListRoom, IRoom } from './interfaces/room.interface';

@Injectable({
  providedIn: 'root',
})
export class RoomService extends BaseService {

  constructor() {
    super();
  }

  public getListRoom(params: IParamsGetListRoom): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Room`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createRoom(body: IRoom): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Room`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateRoom(body: IRoom): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Room/${id}`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeStatusRoom(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Room/${id}/toggle`, undefined).subscribe({
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
