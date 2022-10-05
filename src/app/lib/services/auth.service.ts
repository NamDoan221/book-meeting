import { IPassWord } from '../../account/interfaces/password.interfaces';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOMAIN_SITE } from '../defines/base-url.define';
import { IBodyRegisterAccount, IBodyLogin } from './api/account';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import jwt_decode from "jwt-decode";
import { ConstantDefines } from '../defines/constant.define';
import { BaseService } from './base.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {

  constructor(
    protected http: HttpClient,
    private router: Router,
    private cacheService: CacheService
  ) {
    super(http);
  }

  public getAccountFromCache() {
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (!token) {
      this.redirectToLogin();
      return undefined;
    }
    return JSON.parse(token);
  }

  public getAccount(domain: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${domain}/Account/${id}`).subscribe({
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
      this.post('Auth/login', body).subscribe({
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
      this.get(`Auth/google-callback`).subscribe({
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
    return new Promise((resolve, reject) => {
      this.http.get(`${DOMAIN_SITE()}api/auth/logout`).subscribe({
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
      this.post('Auth/register', body).subscribe({
        next: result => {
          return resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changePassword(password: IPassWord): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`${DOMAIN_SITE()}api/auth/change-pass`, password).subscribe(result => {
        return resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changeInfo(body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.put(`${DOMAIN_SITE()}api/auth/change-info`, body).subscribe(result => {
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
