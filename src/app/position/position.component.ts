import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { ITab } from '../lib/interfaces/tab.interface';
import { IColumnItem } from '../lib/interfaces/table.interfaces';
import { DepartmentService } from '../lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { IParamsGetListPosition, IPosition } from '../lib/services/position/interfaces/position.interface';
import { PositionService } from '../lib/services/position/position.service';
import { BmPositionAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-position',
  templateUrl: './position.component.html'
})
export class BmPositionComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  firstCallDepartment: boolean;
  loadingDepartment: boolean;
  totalPosition: number;
  totalDepartment: number;
  listDepartment: IDepartment[];
  listPosition: IPosition[];
  columnConfig: IColumnItem[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  params: IParamsGetListPosition;
  onSearch: Subject<string> = new Subject();
  onSearchDepartment: Subject<string> = new Subject();
  keyToggleLoading: string;
  searchingWhileEntering: boolean;
  paramsGetDepartment: IParamsGetListDepartment;
  tabs: ITab[];
  selectedTab: number;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  constructor(
    private drawerService: NzDrawerService,
    private positionService: PositionService,
    private departmentService: DepartmentService,
    private toast: ToastrService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.totalPosition = 0;
    this.totalDepartment = 0;
    this.isOpenDraw = false;
    this.columnConfig = [{
      name: 'Tên chức vụ',
      width: '18%'
    },
    {
      name: 'Mã chức vụ',
      width: '18%'
    },
    {
      name: 'Cấp quản lý',
      width: '18%'
    },
    {
      name: 'Phòng ban',
      width: '18%'
    },
    {
      name: 'Mô tả',
      width: '20%'
    },
    {
      name: 'Trạng thái',
      width: '6%'
    }];
    this.listDepartment = [];
    this.listPosition = [];
    this.params = {
      page: 1,
      pageSize: 20,
      active: true
    }
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 20
    }
    this.loadingDepartment = true;
    this.firstCallDepartment = true;
    this.checked = false;
    this.showDelete = false;
    this.selectedTab = 0;
    this.tabs = TabsDefault();
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500)).subscribe((value) => {
      if (this.searchingWhileEntering) {
        this.searchingWhileEntering = false;

        return;
      }
      this.searchPosition(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListPosition();
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

  searchPosition(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listPosition = [];
    this.firstCall = true;
    this.getListPosition();
  }

  searchDepartment(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetDepartment.search : (this.paramsGetDepartment.search = text);
    this.listDepartment = [];
    this.getListDepartment();
  }

  async getListPosition() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.positionService.getListPosition(this.params);
      this.totalPosition = result.Total;
      this.listPosition = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerScrollBottom() {
    if (this.loadingDepartment || !this.totalDepartment || this.totalDepartment <= this.listDepartment.length) {
      return;
    }
    this.paramsGetDepartment.page += 1;
    this.getListDepartment();
  }

  handlerSelectDepartment() {
    this.firstCall = true;
    this.getListPosition();
  }

  handlerSearchDepartment(event: string) {
    this.paramsGetDepartment.page = 1;
    this.onSearchDepartment.next(event);
  }

  handlerAddPosition(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditPosition(event: Event, item: IPosition) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    if (this.setOfCheckedId.size > 0) {
      this.showDelete = true;
      return;
    }
    this.showDelete = false;
  }

  handlerDeletePosition(event: Event) {
    event.stopPropagation();
    console.log(this.setOfCheckedId);
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.Id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange(event: readonly any[]): void {
    this.listOfCurrentPageData = event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.Id));
  }

  addOrEdit(position: IPosition) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmPositionAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: position ? `Sửa chức vụ` : 'Thêm chức vụ',
      nzContent: BmPositionAddEditComponent,
      nzContentParams: {
        position: position,
        modeEdit: position ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (position) {
          Object.assign(position, data);
          return;
        }
        this.listPosition = [data, ...this.listPosition];
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDraw = false;
      this.drawerRefGlobal.close();
    });
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListPosition();
  }

  handlerKeyUp(event) {
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchingWhileEntering = true;
      this.searchPosition(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerActiveChange(event: boolean, item: IPosition) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.positionService.changeStatusPosition(item.Id);
      if (result.success) {
        item.Active = event;
        this.toast.success('i18n_notification_manipulation_success');
        return;
      }
      item.Active = !event;
      this.toast.error('i18n_notification_manipulation_not_success');
    } catch (error) {
      this.toast.error('i18n_notification_manipulation_not_success');
      item.Active = !event;
    } finally {
      this.keyToggleLoading = undefined;
    }
  }

  handlerTabChange(event) {
    this.selectedTab = event.index;
    this.params.active = event.index === 0;
    this.firstCall = true;
    this.getListPosition();
  }

}
