import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IPersonnel, IParamsGetListPersonnel, IParamsGetListPersonnelFreeTime } from './interfaces/personnel.interface';

@Injectable({
  providedIn: 'root',
})
export class PersonnelService extends BaseService {

  constructor() {
    super();
  }

  public getListPersonnel(params: IParamsGetListPersonnel): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Manager/filter`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListPersonnelFreeTime(params: IParamsGetListPersonnelFreeTime): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Account/check-free-time`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getPersonnelById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Manager/${id}`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createPersonnel(body: IPersonnel): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Manager`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updatePersonnel(body: IPersonnel): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Manager/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeStatusPersonnel(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Manager/${id}/toggle-active`, undefined).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public resetPasswordPersonnel(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Manager/${id}/reset-default-password`, undefined).subscribe({
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
