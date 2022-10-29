import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { ITab } from '../lib/interfaces/tab.interface';
import { FunctionService } from '../lib/services/function/function.service';
import { IFunction, IParamsGetListFunction } from '../lib/services/function/interfaces/function.interface';
import { IParamsGetListPosition, IPosition } from '../lib/services/position/interfaces/position.interface';
import { PositionService } from '../lib/services/position/position.service';
import { IBodyUpdateRole, IParamsGetListRole, IRole } from '../lib/services/role/interfaces/role.interface';
import { RoleService } from '../lib/services/role/role.service';
import { IFunctionView } from './interfaces/function.interface';

@Component({
  selector: 'bm-role',
  templateUrl: './role.component.html'
})
export class BmRoleComponent implements OnInit {

  loading: boolean;
  listFunction: IFunctionView[] = [];
  onSearch: Subject<string> = new Subject();
  params: IParamsGetListFunction;
  listRole: IRole[];
  paramsGetListRole: IParamsGetListRole;
  totalPosition: number;
  listPosition: IPosition[];
  onSearchPosition: Subject<string> = new Subject();
  paramsGetPosition: IParamsGetListPosition;
  loadingPosition: boolean;

  constructor(
    private functionService: FunctionService,
    private nzMessageService: NzMessageService,
    private roleService: RoleService,
    private positionService: PositionService
  ) {
    this.loading = true;
    this.params = {
      page: 1,
      pageSize: 100,
      search: '',
      active: true
    };
    this.paramsGetListRole = {
      active: true,
      search: ''
    };

    this.loadingPosition = false;
    this.paramsGetPosition = {
      page: 1,
      pageSize: 20,
      search: ''
    }
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchFunction(value);
    });
    this.onSearchPosition.pipe(debounceTime(500), filter(value => value !== this.paramsGetPosition.search)).subscribe((value) => {
      this.searchPosition(value);
    });
    this.getListFunction();
    this.getListPosition();
  }

  async getListRole() {
    this.loading = true;
    try {
      const result = await this.roleService.getListRole(this.paramsGetListRole);
      this.listRole = result;
      this.mergeFunctionAndRole();
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  mergeFunctionAndRole() {
    this.listFunction = this.listFunction.map(functionItem => {
      const functionItemInRole = this.listRole?.find(role => role.IdFunction === functionItem.Id);
      return {
        ...functionItem,
        checked: !!functionItemInRole,
        FunctionChilds: functionItem.FunctionChilds?.map(functionChild => {
          let check = false;
          if (functionItemInRole) {
            const functionItemInRoleChild = functionItemInRole.RoleChilds?.find(role => role.IdFunction === functionChild.Id);
            if (functionItemInRoleChild) {
              check = true
            }
          }
          return {
            ...functionChild,
            checked: check
          };
        })
      };
    });
  }

  searchFunction(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listFunction = [];
    this.getListFunction();
  }

  async getListFunction() {
    this.loading = true;
    try {
      const result = await this.functionService.getListFunction(this.params);
      this.listFunction = result.Value;
      this.mergeFunctionAndRole();
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerKeyUp(event) {
    if (this.params.search === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchFunction(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerUpdateRole(event: boolean, item: IFunction) {
    try {
      const body: IBodyUpdateRole = {
        IdPosition: this.paramsGetListRole.idPosition,
        IdFunction: item.Id,
        Active: event
      }
      const result = await this.roleService.updateRole(body);
      if (result.success) {
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  handlerSelectPosition() {
    this.getListRole();
  }

  searchPosition(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPosition.search : (this.paramsGetPosition.search = text);
    this.listPosition = [];
    this.getListPosition();
  }

  handlerSearchPosition(event: string) {
    this.paramsGetPosition.page = 1;
    this.onSearchPosition.next(event);
  }

  handlerScrollBottom() {
    if (this.loadingPosition || !this.totalPosition || this.totalPosition <= this.listPosition.length) {
      return;
    }
    this.paramsGetPosition.page += 1;
    this.getListPosition();
  }

  async getListPosition() {
    if (this.loadingPosition) {
      return;
    }
    try {
      this.loadingPosition = true;
      const result = await this.positionService.getListPosition(this.paramsGetPosition);
      this.totalPosition = result.Total;
      this.listPosition = result.Value;
      this.paramsGetListRole.idPosition = this.listPosition.length ? this.listPosition[0].Id : '';
      this.getListRole();
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPosition = false;
    }
  }
}
