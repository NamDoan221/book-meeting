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
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (token) {
      const jwtToken = JSON.parse(token).JwtToken;
      if (jwtToken) {
        header.Authorization = `Bearer ${jwtToken}`;
      }
    }
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

  private handlerResponse(res: any) {
    return res;
  }

  private handlerCatchError(error: any) {
    if (error.status === 401) {
      this.redirectToLogin();
    }

    throw { code: error.status, message: error.message };
  }

  protected get(pathApi: string, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.get(url, this.options).pipe(
      map(res => this.handlerResponse(res)),
      catchError(async (err) => this.handlerCatchError(err))
    );
  }

  protected post(pathApi: string, body: any, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.post(url, body, this.options).pipe(
      map(res => this.handlerResponse(res)),
      catchError(async (err) => this.handlerCatchError(err))
    );
  }

  protected put(pathApi: string, body: any, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.put(url, body, this.options).pipe(
      map(res => this.handlerResponse(res)),
      catchError(async (err) => this.handlerCatchError(err))
    );
  }

  protected patch(pathApi: string, body: any, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.patch(url, body, this.options).pipe(
      map(res => this.handlerResponse(res)),
      catchError(async (err) => this.handlerCatchError(err))
    );
  }

  protected delete(pathApi: string, params: HttpParams = new HttpParams()): Observable<any> {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.delete(url, this.options).pipe(
      map(res => this.handlerResponse(res)),
      catchError(async (err) => this.handlerCatchError(err))
    );
  }
}
