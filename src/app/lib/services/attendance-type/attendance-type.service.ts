import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IAttendanceType, IParamsGetListAttendanceType } from './interfaces/attendance-type.interface';

@Injectable({
  providedIn: 'root',
})
export class AttendanceTypeService extends BaseService {

  constructor() {
    super();
  }

  public getListAttendanceType(params: IParamsGetListAttendanceType): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/AttendanceType`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListAttendanceTypeActive(params: IParamsGetListAttendanceType): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/AttendanceType/active`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createAttendanceType(body: IAttendanceType): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/AttendanceType`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateAttendanceType(body: IAttendanceType): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/AttendanceType/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeStatusAttendanceType(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/AttendanceType/${id}/toggle`, undefined).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateIndexAttendanceType(body: { id: string, index: number }[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/AttendanceType/indexs`, body).subscribe({
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
