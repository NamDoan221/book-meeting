import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanActivateChild,
  CanLoad,
  Route,
  CanDeactivate,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { CheckDeactivate } from '../deactivate/check-deactivate';

@Injectable({
  providedIn: 'root',
})
export class ArticlesGuard
  implements
    CanActivate,
    CanActivateChild,
    CanLoad,
    CanDeactivate<CheckDeactivate> {
  constructor(private readonly authService: AuthService) {}
  canDeactivate(
    component: CheckDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> {
    return component.checkDeactivate(currentRoute, currentState, nextState);
  }

  canLoad(
    route: Route,
    segments: import('@angular/router').UrlSegment[]
  ): Observable<boolean> {
    return this.authService.currentUser.pipe(map((user) => !!user));
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const targetSlug = childRoute.params.slug;
    if (!targetSlug) {
      return of(false);
    }
    return this.authService.currentUser.pipe(
      map((user) => user.articles.includes(targetSlug))
    );
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser.pipe(map((user) => !!user));
  }
}
