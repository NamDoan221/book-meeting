import { PassWord } from './../../account/api/password';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOMAIN_SITE } from './base-url.define';
import { AccountRegister, AccountUser } from './api/account';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  public getAccountLocalStorage(): any {
    return JSON.parse(localStorage.getItem('account-info'));
  }

  public setAccountLocalStorage(account: AccountUser): any {
    localStorage.setItem('account-info', JSON.stringify(account));
  }

  public getAccount(): Promise<any> {
    const options = this.createHeaderOption();
    return new Promise((resolve, reject) => {
      this.http.get(`${DOMAIN_SITE()}api/auth/me`, options).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  private createHeaderOption(): any {
    return {
      headers: {
        'x-access-token': JSON.parse(localStorage.getItem('access-token')).token
      }
    };
  }

  public login(body: AccountUser): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${DOMAIN_SITE()}api/auth/login`, body).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${DOMAIN_SITE()}api/auth/logout`).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public register(body: AccountRegister): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`${DOMAIN_SITE()}api/auth/register`, body).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changePassword(password: PassWord): Promise<any> {
    const options = this.createHeaderOption();
    return new Promise((resolve, reject) => {
      this.http.put(`${DOMAIN_SITE()}api/auth/change-pass`, password, options).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changeInfo(body: AccountRegister): Promise<any> {
    const options = this.createHeaderOption();
    return new Promise((resolve, reject) => {
      this.http.put(`${DOMAIN_SITE()}api/auth/change-info`, body, options).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public redirectToLogin(): void {
    this.router.navigate(['login']);
  }

  public verifyToken(): boolean {
    const token = this.getAccountLocalStorage();
    if (!token) {
      this.redirectToLogin();
      return false;
    }
    // const tokenTemp = this.jwtHelper.decodeToken(token);
    if (!token.auth && token.token === null) {
      // this._cacheService.clearAll();
      localStorage.clear();
      this.redirectToLogin();
      return false;
    }
    return true;
  }
}

@Injectable()
export class UserCanActive implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let path: string = window.location.pathname === DOMAIN_SITE() ? state.url.split('?')[0] : window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const pathValue = urlParams.get('path');
    if (!this.checkLogin(path)) {
      // this.redirectToLogin();
      this.router.navigate(['login']);
      return false;
    }

    // if (!this.auth.checkPermission(path, undefined, false, false)) {
    //   return false;
    // }
    return true;
  }

  checkLogin(url: string): boolean {
    if (this.auth.verifyToken()) {
      return true;
    }
    return false;
  }
}
