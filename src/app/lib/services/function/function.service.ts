import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IParamsGetListFunction, IFunction } from './interfaces/function.interface';

@Injectable({
  providedIn: 'root',
})
export class FunctionService extends BaseService {

  constructor() {
    super();
  }

  public getListFunction(params: IParamsGetListFunction): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`Function`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createFunction(body: IFunction): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`Function`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateFunction(body: IFunction): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`Function/${id}`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeStatusFunction(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`Function/${id}/toggle`, undefined).subscribe({
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
