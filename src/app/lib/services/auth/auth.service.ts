import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import jwt_decode from "jwt-decode";
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from '../../defines/constant.define';
import { BaseService } from '../base.service';
import { IBodyChangeInfo, IBodyLogin, IBodyRegisterAccount, IParamsConnectGoogle, IPassWord, IToken } from './interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {

  constructor(
    private nzMessageService: NzMessageService
  ) {
    super();
  }

  public decodeToken(): IToken | undefined {
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (!token) {
      this.redirectToLogin();
      return undefined;
    }
    return JSON.parse(token);
  }

  public setToken(token: string) {
    this.cacheService.setKey(ConstantDefines.TOKEN_KEY, token);
  }

  public getAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.domain}/Account/${id}`).subscribe({
        next: result => {
          resolve(result);
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
          this.setToken(JSON.stringify(result.result));
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public connectGoogle(params: IParamsConnectGoogle): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Auth/authenticate-gg`, undefined, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public logout(): Promise<any> {
    const token = this.decodeToken().RefreshToken;
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Account/revoke-token`, { Token: token }).subscribe({
        next: result => {
          resolve(result);
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
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public checkExistAccount(body: { phone: string, email: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`${this.domain}/Auth/check-exist-account`, body).subscribe({
        next: result => {
          resolve(result);
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
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changePassword(id: string, body: IPassWord): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Account/${id}/change-password`, undefined, new HttpParams({ fromObject: { ...body } })).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changeInfo(body: IBodyChangeInfo, idAccount: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Account/${idAccount}`, body).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public disconnectGoogle(idAccount: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`${this.domain}/Account/${idAccount}/disconnect-google`, undefined).subscribe(result => {
        resolve(result);
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
    return this.post(`${this.domain}/Auth/refresh-tokens`, body)
  }

  public checkPermission(path: string, action?: string) {
    const roles = this.decodeToken().Roles;
    const findRoleByPath = roles.find(role => role.Url === path);
    if (!findRoleByPath) {
      this.nzMessageService.error('Bạn không có quyền truy cập chức năng này.');
      if (roles.length) {
        this.router.navigateByUrl(roles[0].Url);
        return false;
      }
      return false;
    }
    if (action) {
      const childFound = findRoleByPath.RoleChilds.find(child => child.FunctionCode === action);
      if (childFound && childFound.Active) {
        return true;
      }
      this.nzMessageService.error('Bạn không có quyền truy cập chức năng này.');
      return false;
    }
    return true;
  }
}

@Injectable()
export class UserCanActive implements CanActivate {

  constructor(private auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.verifyToken()) {
      return false;
    }
    if (!this.auth.checkPermission(state.url.split('?')[0])) {
      return false;
    }
    return true;
  }
}
