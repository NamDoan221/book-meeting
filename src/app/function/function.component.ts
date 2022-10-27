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
import { BmFunctionAddEditComponent } from './add-edit/add-edit.component';
import { IFunctionTreeNode } from './interfaces/function.interface';

@Component({
  selector: 'bm-function',
  templateUrl: './function.component.html'
})
export class BmFunctionComponent implements OnInit {

  firstCall: boolean;
  loading: boolean;
  total: number;
  listFunction: IFunctionTreeNode[] = [];
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

  listOfMapData: IFunctionTreeNode[] = [];
  mapOfExpandedData: { [key: string]: IFunctionTreeNode[] } = {};

  constructor(
    private drawerService: NzDrawerService,
    private functionService: FunctionService,
    private nzMessageService: NzMessageService
  ) {
    this.firstCall = true;
    this.loading = false;
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
      pageSize: 20,
      active: true
    };
    this.selectedTab = 0;
    this.tabs = TabsDefault();
    this.showDelete = false;
    this.checked = false;
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchFunction(value);
    });
    this.getListFunction();
  }

  collapse(array: IFunctionTreeNode[], data: IFunctionTreeNode, $event: boolean): void {
    if (!$event) {
      if (data.FunctionChilds) {
        data.FunctionChilds.forEach(d => {
          const target = array.find(a => a.Id === d.Id)!;
          target.Expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: IFunctionTreeNode): IFunctionTreeNode[] {
    const stack: IFunctionTreeNode[] = [];
    const array: IFunctionTreeNode[] = [];
    const hashMap = {};
    stack.push({ ...root, Level: 0, Expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.FunctionChilds) {
        for (let i = node.FunctionChilds.length - 1; i >= 0; i--) {
          stack.push({ ...node.FunctionChilds[i], Level: node.Level! + 1, Expand: false, Parent: node });
        }
      }
    }

    return array;
  }

  visitNode(node: IFunctionTreeNode, hashMap: { [key: string]: boolean }, array: IFunctionTreeNode[]): void {
    if (!hashMap[node.Id]) {
      hashMap[node.Id] = true;
      array.push(node);
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
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const result = await this.functionService.getListFunction(this.params);
      this.listFunction = result.Value;
      this.total = result.Total;
      this.refreshTable();
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  refreshTable() {
    this.listFunction.forEach(item => {
      this.mapOfExpandedData[item.Id] = this.convertTreeToList(item);
    });
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
          this.refreshTable();
          return;
        }
        const functionUpdate = this.listFunction.find(item => item.Id === data.IdParent);
        if (functionUpdate) {
          functionUpdate.FunctionChilds = [data, ...functionUpdate.FunctionChilds];
          this.refreshTable();
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
    this.getListFunction();
  }

  updateListFunctionAfterChangeActive(item: IFunction) {
    if (!item.IdParent) {
      this.listFunction = this.listFunction.filter(element => element.Id !== item.Id);
      return;
    }
    const functionUpdate = this.listFunction.find(func => func.Id === item.IdParent);
    if (functionUpdate) {
      functionUpdate.FunctionChilds = functionUpdate.FunctionChilds.filter(child => child.Id !== item.Id);
    }
  }

  async handlerActiveChange(event: boolean, item: IFunction) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.functionService.changeStatusFunction(item.Id);
      if (result.success) {
        item.Active = event;
        this.updateListFunctionAfterChangeActive(item);
        this.refreshTable();
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
