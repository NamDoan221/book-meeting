import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { DepartmentService } from '../lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { BmDepartmentAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-department',
  templateUrl: './department.component.html'
})
export class BmDepartmentComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  total: number;
  listDepartment: IDepartment[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  params: IParamsGetListDepartment;
  onSearch: Subject<string> = new Subject();
  keyToggleLoading: string;
  tabs: Array<any>;
  selectedTab: number;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  constructor(
    private drawerService: NzDrawerService,
    private departmentService: DepartmentService,
    private nzMessageService: NzMessageService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.total = 0;
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên phòng ban',
      'Mã phòng ban',
      'Cấp quản lý',
      'Mô tả',
      'Trạng thái'
    ];
    this.params = {
      page: 1,
      pageSize: 20,
      active: true,
      search: ''
    }
    this.selectedTab = 0;
    this.tabs = TabsDefault();
    this.showDelete = false;
    this.checked = false;
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListDepartment();
  }

  searchDepartment(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listDepartment = [];
    this.firstCall = true;
    this.getListDepartment();
  }

  async getListDepartment() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.departmentService.getListDepartment(this.params);
      this.total = result.Total;
      this.listDepartment = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddDepartment(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditDepartment(event: Event, item: IDepartment) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(department: IDepartment) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmDepartmentAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: department ? `Sửa phòng ban` : 'Thêm phòng ban',
      nzContent: BmDepartmentAddEditComponent,
      nzContentParams: {
        department: department,
        modeEdit: department ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (department) {
          Object.assign(department, data);
          return;
        }
        this.listDepartment = [data, ...this.listDepartment];
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
    this.getListDepartment();
  }

  handlerKeyUp(event) {
    if (this.params.search === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchDepartment(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerActiveChange(event: boolean, item: IDepartment) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.departmentService.changeStatusDepartment(item.Id);
      if (result.success) {
        item.Active = event;
        this.listDepartment = this.listDepartment.filter(element => element.Id !== item.Id)
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

  handlerTabChange(event) {
    this.selectedTab = event.index;
    this.params.active = event.index === 0;
    this.firstCall = true;
    this.getListDepartment();
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

  handlerDeleteDepartment(event: Event) {
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
}
