import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { CacheService } from "../cache.service";

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private cacheService: CacheService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (DEFAULT_REFRESH_URL_BLACKLIST.some(item => req.url.includes(item))) {
      return next.handle(req);
    }
    let authReq = req;
    const jwtToken = this.authService.decodeToken()?.JwtToken;
    if (jwtToken) {
      authReq = this.addTokenHeader(req);
    }
    return next.handle(authReq).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403 || error.error.message == 'Unauthorized')) {
        return this.handle401Error(authReq, next);
      }
      return throwError(() => error);
    }));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = this.authService.decodeToken().RefreshToken;
      console.log(refreshToken);
      return this.authService.refreshToken({ refreshToken: refreshToken }).pipe(
        switchMap((res: any) => {
          this.authService.setToken(JSON.stringify(res));
          // localStorage.setItem('access_token', res.access_token);
          // this.authService.verifyToken(res.access_token).subscribe((resVer: any) => {
          //   localStorage.setItem('username', resVer.sub);
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.JwtToken);
          // })
          return next.handle(this.addTokenHeader(request));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          console.log(err);
          this.cacheService.clearAll();
          this.router.navigate(['login']);
          return throwError(() => err);
        })
      );
    }
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(this.addTokenHeader(request)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>) {
    const jwtToken = this.authService.decodeToken()?.JwtToken;
    if (jwtToken) {
      request = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${jwtToken}`),
      });
    }
    return request;
  }
}

export const AuthInterceptorProviders = { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true };
export const DEFAULT_REFRESH_URL_BLACKLIST = ['login', 'refresh-tokens', 'register', 'check-exist-account'];
