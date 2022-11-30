import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DOMAIN_SITE } from '../defines/base-url.define';
import { ConstantDefines } from '../defines/constant.define';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class BaseService {

  protected domain = ConstantDefines.DOMAIN;
  protected options: any;
  protected apiUrl: string;
  protected http = inject(HttpClient);
  protected router = inject(Router);
  protected cacheService = inject(CacheService);

  constructor() {
    this.apiUrl = DOMAIN_SITE();
  }

  protected redirectToLogin(): void {
    this.cacheService.clearAll();
    this.router.navigate(['login']);
  }

  private setRequestOptions(params: HttpParams) {
    const header: any = {
      'Content-Type': 'application/json',
      'Client-Version': 'v1.0'
    };
    const headers = new HttpHeaders(header);
    this.options = { headers: headers, params: this.removeNullValuesFromHttpParams(params) };
  }

  private removeNullValuesFromHttpParams(params: HttpParams) {
    const paramsKeys = params.keys();
    paramsKeys.forEach((key) => {
      const value = params.get(key);
      if (value === null || value === undefined || value === '') {
        params['map'].delete(key);
      }
    });

    return params;
  }

  protected get(pathApi: string, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.get(url, this.options);
  }

  protected post(pathApi: string, body: any, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.post(url, body, this.options);
  }

  protected put(pathApi: string, body: any, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.put(url, body, this.options);
  }

  protected patch(pathApi: string, body: any, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.patch(url, body, this.options);
  }

  protected delete(pathApi: string, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.delete(url, this.options);
  }
}
