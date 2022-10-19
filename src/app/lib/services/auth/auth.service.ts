import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import jwt_decode from "jwt-decode";
import { DOMAIN_SITE } from '../../defines/base-url.define';
import { ConstantDefines } from '../../defines/constant.define';
import { BaseService } from '../base.service';
import { IBodyLogin, IBodyRegisterAccount, IPassWord, IToken } from './interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {

  constructor() {
    super();
  }

  public getAccountFromCache(): IToken | undefined {
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (!token) {
      this.redirectToLogin();
      return undefined;
    }
    return JSON.parse(token);
  }

  public getAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.domain}/Account/${id}`).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public login(body: IBodyLogin): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Auth/login`, body).subscribe({
        next: result => {
          if (!result.success) {
            return reject();
          }
          this.cacheService.setKey(ConstantDefines.TOKEN_KEY, JSON.stringify(result.result));
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public loginGoogle(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`${this.domain}/Auth/google-callback`).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public logout(): Promise<any> {
    const token = this.getAccountFromCache().JwtToken;
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Account/revoke-token`, { Token: token }).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public register(body: IBodyRegisterAccount): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Auth/register`, body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeAvatar(id: string, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Account/${id}/change-avatar`, undefined, new HttpParams({ fromObject: { url: url } })).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changePassword(id: string, body: IPassWord): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Account/${id}/change-password`, body).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changeInfo(body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Account`, body).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public verifyToken(): boolean {
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (!token) {
      this.redirectToLogin();
      return false;
    }
    const tokenTemp = jwt_decode<{ id?: string }>(JSON.parse(token).JwtToken);
    if (!tokenTemp || !tokenTemp.id) {
      this.cacheService.clearAll();
      this.redirectToLogin();
      return false;
    }
    return true;
  }

  public refreshToken(body: { refreshToken: string }) {
    return new Promise((resolve, reject) => {
      this.post('Auth/refresh-tokens', body).subscribe({
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

@Injectable()
export class UserCanActive implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let path: string = window.location.pathname === DOMAIN_SITE() ? state.url.split('?')[0] : window.location.pathname;
    console.log(route.queryParams, path);

    if (!this.checkLogin()) {
      return false;
    }

    // if (!this.auth.checkPermission(path, undefined, false, false)) {
    //   return false;
    // }
    return true;
  }

  checkLogin(): boolean {
    if (this.auth.verifyToken()) {
      return true;
    }
    return false;
  }
}
