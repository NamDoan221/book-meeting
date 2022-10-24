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
import { IParamsGetListRole, IRole } from '../lib/services/role/interfaces/role.interface';
import { RoleService } from '../lib/services/role/role.service';
import { BmFunctionAddEditComponent } from './add-edit/add-edit.component';
import { IFunctionView } from './interfaces/function.interface';

@Component({
  selector: 'bm-role',
  templateUrl: './role.component.html'
})
export class BmRoleComponent implements OnInit {

  firstCall: boolean;
  loading: boolean;
  total: number;
  listFunction: IFunctionView[] = [];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  params: IParamsGetListFunction;
  keyToggleLoading: string;
  listRole: IRole[];
  paramsGetListRole: IParamsGetListRole;
  totalPosition: number;
  listPosition: IPosition[];
  onSearchPosition: Subject<string> = new Subject();
  paramsGetPosition: IParamsGetListPosition;
  loadingPosition: boolean;

  constructor(
    private drawerService: NzDrawerService,
    private functionService: FunctionService,
    private nzMessageService: NzMessageService,
    private roleService: RoleService,
    private positionService: PositionService
  ) {
    this.firstCall = true;
    this.loading = true;
    this.total = 0;
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên chức năng',
      'Mã chức năng',
      'Đường dẫn tới trang',
      'Hiển thị trên menu',
      'Mô tả',
      'Trạng thái'
    ];
    this.params = {
      page: 1,
      pageSize: 100,
      active: true
    };
    this.paramsGetListRole = {
      active: true
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
    // this.getListRole();
  }

  async getListRole() {
    // if (this.loading) {
    //   return;
    // }
    this.loading = true;
    try {
      const result = await this.roleService.getListRole(this.paramsGetListRole);
      this.listRole = result;
      console.log(result);
      this.listFunction = this.listFunction.map(functionItem => {
        console.log('functionItem.FunctionChilds', functionItem.FunctionChilds);

        return {
          ...functionItem,
          FunctionChilds: functionItem.FunctionChilds?.map(functionChild => {
            let check = false;
            console.log('this.listRole', this.listRole);

            const functionItemInRole = this.listRole?.find(role => role.IdFunction === functionItem.Id);
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
    } catch (error) {
      console.log(error);
    } finally {
      // this.loading = false;
    }
  }

  searchFunction(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listFunction = [];
    this.firstCall = true;
    this.getListFunction();
  }

  async getListFunction() {
    // if (this.loading) {
    //   return;
    // }
    // this.loading = true;
    try {
      const result = await this.functionService.getListFunction(this.params);
      this.listFunction = result.Value;
      this.total = result.Total;
    } catch (error) {
      console.log(error);
    } finally {
      // this.loading = false;
    }
  }

  handlerAddSubFunction(event: Event, parentId: string) {
    event.stopPropagation();
    this.addOrEdit(undefined, parentId);
  }

  handlerAddFunction(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditFunction(event: Event, item: IFunction) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(functionData: IFunction, parentId?: string) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmFunctionAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: functionData ? `Sửa chức năng` : 'Thêm chức năng',
      nzContent: BmFunctionAddEditComponent,
      nzContentParams: {
        parentId: parentId,
        function: functionData,
        modeEdit: functionData ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (functionData) {
          Object.assign(functionData, data);
          return;
        }
        if (!data.IdParent) {
          this.listFunction = [data, ...this.listFunction];
          return;
        }
        const functionUpdate = this.listFunction.find(item => item.Id === data.IdParent);
        if (functionUpdate) {
          functionUpdate.FunctionChilds = [data, ...functionUpdate.FunctionChilds];
        }
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDraw = false;
      this.drawerRefGlobal.close();
    });
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

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListRole();
  }

  async handlerActiveChange(event: boolean, item: IFunction) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.functionService.changeStatusFunction(item.Id);
      if (result.success) {
        item.Active = event;
        this.listFunction = this.listFunction.filter(element => element.Id !== item.Id)
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      item.Active = !event;
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
      item.Active = !event;
    } finally {
      this.keyToggleLoading = undefined;
    }
  }

  handlerUpdateRole(event: boolean, item: IFunction) {

  }

  handlerSelectPosition() {
    this.firstCall = true;
    this.getListRole();
  }

  searchPosition(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPosition.search : (this.paramsGetPosition.search = text);
    this.listPosition = [];
    this.firstCall = true;
    this.getListPosition();
  }

  handlerSearchPosition(event: string) {
    console.log('vao');

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
