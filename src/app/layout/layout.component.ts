import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../lib/services/auth/auth.service';
import { IToken } from '../lib/services/auth/interfaces/auth.interfaces';
import { CacheService } from '../lib/services/cache.service';
import { FunctionService } from '../lib/services/function/function.service';
import { IFunction } from '../lib/services/function/interfaces/function.interface';
import { IRole } from '../lib/services/role/interfaces/role.interface';
import { menuDefault } from './defines/layout.define';

@Component({
  selector: 'bm-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class BmLayoutComponent implements OnInit {
  public isCollapsed: boolean;
  menuData: IFunction[];
  currentPath: string;
  accountFromCache: IToken;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cacheService: CacheService,
    private functionService: FunctionService,
    private nzMessageService: NzMessageService,
    private zone: NgZone
  ) {
    this.isCollapsed = false;
    this.menuData = []
  }

  async ngOnInit(): Promise<void> {
    this.accountFromCache = this.auth.decodeToken();
    this.buildMenu();
    this.currentPath = this.router.url;
  }

  async buildMenu() {
    const roles = this.auth.decodeToken().Roles;
    try {
      const result = await this.functionService.getListFunction({ page: 1, pageSize: 100, active: true, search: '' });
      const functionByRole = result.Value?.filter(item => roles?.find(role => role.IdFunction === item.Id));
      menuDefault().forEach(item => {
        const functionChilds = [];
        item.FunctionChilds?.forEach(child => {
          if (!!functionByRole?.find(element => element.IsMenu && element.Url === child.Url)) {
            functionChilds.push({
              ...child,
              IsMenu: true
            })
          }
        });
        if (!!functionChilds?.length) {
          this.menuData.push({
            ...item,
            IsMenu: true,
            FunctionChilds: functionChilds
          })
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async handlerRouting(event: Event, url: string) {
    event.stopPropagation();
    if (!url) {
      return;
    }
    if (url === '/logout') {
      try {
        const result = await this.auth.logout();
        this.cacheService.clearAll();
        this.zone.run(() => {
          this.router.navigate(['/login']);
        });
      } catch (error) {
        console.log(error);
      }
      return;
    }
    this.currentPath = url;
    this.zone.run(() => {
      this.router.navigate([url]);
    });
  }
}
