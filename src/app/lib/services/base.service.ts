import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DOMAIN_SITE } from './base-url.define';

@Injectable({
  providedIn: 'root',
})
export class BaseService {

  protected options: any;
  protected apiUrl: string;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.apiUrl = DOMAIN_SITE();
  }

  protected setRequestOptions(params: HttpParams) {
    const header: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Client-Version': 'v1.0'
    };
    const headers = new HttpHeaders(header);
    this.options = { headers: headers, params: params };
  }

  public get(pathApi: string, params: HttpParams = new HttpParams()) {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.get(url, this.options);
  }

  public post(pathApi: string, body: any, params: HttpParams = new HttpParams()) {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.post(url, body, this.options);
  }

  public put(pathApi: string, body: any, params: HttpParams = new HttpParams()) {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.put(url, body, this.options);
  }

  public patch(pathApi: string, body: any, params: HttpParams = new HttpParams()) {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.patch(url, body, this.options);
  }

  public delete(pathApi: string, params: HttpParams = new HttpParams()) {
    this.setRequestOptions(params);
    const url = `${this.apiUrl}${pathApi}`;
    return this.http.delete(url, this.options);
  }
}
