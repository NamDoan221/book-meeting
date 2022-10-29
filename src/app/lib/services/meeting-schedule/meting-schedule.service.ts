import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodyAddPersonnelToMeetingSchedule, IMeetingSchedule, IParamsGetListMeetingSchedule } from './interfaces/metting-schedule.interface';

@Injectable({
  providedIn: 'root',
})
export class MeetingScheduleService extends BaseService {

  constructor() {
    super();
  }

  public getListMeetingSchedule(params: IParamsGetListMeetingSchedule): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/filter`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createMeetingSchedule(body: IMeetingSchedule): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Mschedule`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateMeetingSchedule(body: IMeetingSchedule): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Mschedule/${id}`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getDetailMeetingSchedule(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/${id}/detail`).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getDetailAttendanceMeetingSchedule(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/${id}/detail-attendance`).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public addPersonnelToMeetingSchedule(body: IBodyAddPersonnelToMeetingSchedule): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Mschedule/detail`, body).subscribe({
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
