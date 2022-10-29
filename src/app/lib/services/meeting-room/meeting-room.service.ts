import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IParamsGetListMeetingRoom, IMeetingRoom, IParamsGetListMeetingRoomFreeTime } from './interfaces/room.interface';

@Injectable({
  providedIn: 'root',
})
export class MeetingRoomService extends BaseService {

  constructor() {
    super();
  }

  public getListMeetingRoom(params: IParamsGetListMeetingRoom): Promise<any> {
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

  public getListMeetingRoomFreeTime(params: IParamsGetListMeetingRoomFreeTime): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Room/check-free-time`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createMeetingRoom(body: IMeetingRoom): Promise<any> {
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

  public updateMeetingRoom(body: IMeetingRoom): Promise<any> {
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

  public changeStatusMeetingRoom(id: string): Promise<any> {
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
