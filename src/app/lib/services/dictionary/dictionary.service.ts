import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IDataItemGetByTypeDictionary, IDictionaryItem } from './interfaces/dictionary.interface';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService extends BaseService {

  constructor() {
    super();
  }

  public getListTypeDictionary(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Dictionary/types`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createTypeDictionary(body: IDictionaryItem): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Dictionary/type`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateTypeDictionary(body: IDictionaryItem): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Dictionary/${id}/type`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteTypeDictionary(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.delete(`${this.domain}/Dictionary/${id}/type`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListDataByTypeDictionary(type: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Dictionary/${type}/type`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createTypeDictionaryByType(body: IDataItemGetByTypeDictionary): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Dictionary`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateTypeDictionaryByType(body: IDataItemGetByTypeDictionary): Promise<any> {
    const id = body.Id;
    delete body.Id;
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Dictionary/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteTypeDictionaryByType(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.delete(`${this.domain}/Dictionary/${id}`).subscribe({
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
