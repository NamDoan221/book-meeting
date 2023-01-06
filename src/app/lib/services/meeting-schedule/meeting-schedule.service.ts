import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodyAddPersonnelToMeetingSchedule, IBodyUpdateStatusAttendance, IMeetingSchedule, IMeetingScheduleJoin, IParamsGetListMeetingSchedule } from './interfaces/meeting-schedule.interface';

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
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListMeetingScheduleCreator(params: IParamsGetListMeetingSchedule): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/creator`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListMeetingSchedulePersonal(params: IParamsGetListMeetingSchedule): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/personal`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
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
          resolve(result);
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
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getDetailMeetingSchedule(id: string, params: { search: string, active: boolean }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/${id}/detail`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
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
          resolve(result);
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
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public addListPersonnelToMeetingSchedule(body: IMeetingScheduleJoin[], idMeetingSchedule: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Mschedule/${idMeetingSchedule}/details`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deletePersonnelInMeetingSchedule(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.delete(`${this.domain}/Mschedule/${id}/detail`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteMultiplePersonnelInMeetingSchedule(ids: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Mschedule/detail-multiple`, ids).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateStatusAttendance(id: string, body: IBodyUpdateStatusAttendance[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Mschedule/${id}/detail-status-multiple`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public startAttendance(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Mschedule/${id}/start`, {}).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public endAttendance(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Mschedule/${id}/end`, {}).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getMeetingScheduleByIds(ids: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Mschedule/by-ids`, new HttpParams({ fromObject: { listId: ids } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public attendanceByFaceImage(body: FormData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postFormData(`recog`, body, new HttpParams(), true).subscribe({
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
