import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IDepartment, IParamsGetListDepartment } from './interfaces/department.interface';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService extends BaseService {

  constructor() {
    super();
  }

  public getListDepartment(params: IParamsGetListDepartment): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Department`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createDepartment(body: IDepartment): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Department`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateDepartment(body: IDepartment): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Department/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeStatusDepartment(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Department/${id}/toggle`, undefined).subscribe({
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
