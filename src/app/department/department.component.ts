import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
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
  searchingWhileEntering: boolean;
  tabs: Array<any>;
  selectedTab: number;

  constructor(
    private drawerService: NzDrawerService,
    private departmentService: DepartmentService,
    private toast: ToastrService
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
      active: true
    }
    this.selectedTab = 0;
    this.tabs = TabsDefault();
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500)).subscribe((value) => {
      if (this.searchingWhileEntering) {
        this.searchingWhileEntering = false;

        return;
      }
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
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchingWhileEntering = true;
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
    this.getListDepartment();
  }
}
