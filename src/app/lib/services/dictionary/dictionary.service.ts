import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';

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
          return resolve(result);
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
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }
}
