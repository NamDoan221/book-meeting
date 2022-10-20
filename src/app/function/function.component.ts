import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { ITab } from '../lib/interfaces/tab.interface';
import { FunctionService } from '../lib/services/function/function.service';
import { IFunction, IParamsGetListFunction } from '../lib/services/function/interfaces/function.interface';
import { BmFunctionAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-function',
  templateUrl: './function.component.html'
})
export class BmFunctionComponent implements OnInit {

  firstCall: boolean;
  loading: boolean;
  total: number;
  listFunction: IFunction[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  params: IParamsGetListFunction;
  keyToggleLoading: string;
  tabs: ITab[];
  selectedTab: number;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  constructor(
    private drawerService: NzDrawerService,
    private functionService: FunctionService,
    private toast: ToastrService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.total = 0;
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên chức năng',
      'Mã chức năng',
      'Đường dẫn',
      'Hiển thị trên menu',
      'Mô tả',
      'Trạng thái'
    ];
    this.params = {
      page: 1,
      pageSize: 20,
      active: true
    };
    this.selectedTab = 0;
    this.tabs = TabsDefault();
    this.showDelete = false;
    this.checked = false;
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500)).subscribe((value) => {
      this.searchFunction(value);
    });
    this.getListFunction();
  }

  searchFunction(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listFunction = [];
    this.firstCall = true;
    this.getListFunction();
  }

  async getListFunction() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const result = await this.functionService.getListFunction(this.params);
      this.listFunction = result.Value;
      this.total = result.Total;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddFunction(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditFunction(event: Event, item: IFunction) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(functionData: IFunction) {
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
        this.listFunction = [data, ...this.listFunction];
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
    this.getListFunction();
  }

  async handlerActiveChange(event: boolean, item: IFunction) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.functionService.changeStatusFunction(item.Id);
      if (result.success) {
        item.Active = event;
        this.listFunction = this.listFunction.filter(element => element.Id !== item.Id)
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
    this.getListFunction();
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

  handlerDeleteFunction(event: Event) {
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
