import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { AuthService } from '../lib/services/auth/auth.service';
import { DepartmentService } from '../lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { FunctionService } from '../lib/services/function/function.service';
import { IParamsGetListFunction } from '../lib/services/function/interfaces/function.interface';
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

  totalDepartment: number;
  listDepartment: IDepartment[];
  onSearchDepartment: Subject<string> = new Subject();
  paramsGetDepartment: IParamsGetListDepartment;
  firstCallDepartment: boolean;
  loadingDepartment: boolean;

  constructor(
    private functionService: FunctionService,
    private nzMessageService: NzMessageService,
    private roleService: RoleService,
    private positionService: PositionService,
    private departmentService: DepartmentService,
    private authService: AuthService
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

    this.totalDepartment = 0;
    this.listDepartment = [];
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 20,
      active: true,
      search: ''
    };
    this.loadingDepartment = true;
    this.firstCallDepartment = true;
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchFunction(value);
    });
    this.onSearchPosition.pipe(debounceTime(500), filter(value => value !== this.paramsGetPosition.search)).subscribe((value) => {
      this.searchPosition(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListDepartment();
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
            if (functionItemInRoleChild && functionItemInRoleChild.Active) {
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

  async handlerUpdateRole(event: boolean, item: IFunctionView) {
    if (!this.authService.checkPermission('/role', 'EDIT_ROLE')) {
      setTimeout(() => { item.checked = !event }, 0);
      return;
    }
    try {
      const body: IBodyUpdateRole = {
        IdPosition: this.paramsGetListRole.idPosition,
        IdFunction: item.Id,
        Active: event
      }
      const result = await this.roleService.updateRole(body);
      if (result.success) {
        item.checked = event;
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      item.checked = !event;
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
      item.checked = !event;
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

  async getListDepartment() {
    if (this.loadingDepartment && !this.firstCallDepartment) {
      return;
    }
    this.firstCallDepartment = false;
    try {
      this.loadingDepartment = true;
      const result = await this.departmentService.getListDepartment(this.paramsGetDepartment);
      this.totalDepartment = result.Total;
      this.listDepartment.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingDepartment = false;
      this.loading = false;
    }
  }

  searchDepartment(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetDepartment.search : (this.paramsGetDepartment.search = text);
    this.listDepartment = [];
    this.getListDepartment();
  }

  handlerSelectDepartment(event: string) {
    this.paramsGetPosition.idDepartment = event;
    this.getListPosition();
  }

  handlerSearchDepartment(event: string) {
    this.paramsGetDepartment.page = 1;
    this.onSearchDepartment.next(event);
  }

  handlerScrollBottomDepartment() {
    if (this.loadingDepartment || !this.totalDepartment || this.totalDepartment <= this.listDepartment.length) {
      return;
    }
    this.paramsGetDepartment.page += 1;
    this.getListDepartment();
  }
}
