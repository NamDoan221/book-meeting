import { Component, Input, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { DictionaryService } from 'src/app/lib/services/dictionary/dictionary.service';
import { IDataItemGetByTypeDictionary, IDictionaryItem } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { BmDictionaryAddEditComponent } from '../add-edit/add-edit.component';

@Component({
  selector: 'bm-dictionary-add-detail',
  templateUrl: './detail.component.html'
})
export class BmDictionaryDetailComponent implements OnInit {

  firstCall: boolean;
  loading: boolean;
  total: number;
  listDictionaryChild: IDataItemGetByTypeDictionary[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  keyToggleLoading: string;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  @Input() dictionary: IDictionaryItem;

  constructor(
    private drawerService: NzDrawerService,
    private dictionaryService: DictionaryService,
    private nzMessageService: NzMessageService,
    private authService: AuthService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên danh mục con',
      'Mã danh mục con',
      'Mô tả',
      'Trạng thái'
    ];
    this.showDelete = false;
    this.checked = false;
    this.total = 0;
  }

  ngOnInit(): void {
    this.getListDictionaryChild();
  }

  async getListDictionaryChild() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const result = await this.dictionaryService.getListDataByTypeDictionary(this.dictionary.Code);
      this.listDictionaryChild = result;
      this.total = result.length;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddDictionary(event: Event) {
    event.stopPropagation();
    if (!this.authService.checkPermission('/dictionary', 'ADD_DICTIONARY')) {
      return;
    }
    this.addOrEdit(undefined);
  }

  handlerEditDictionary(event: Event, item: IDataItemGetByTypeDictionary) {
    event.stopPropagation();
    if (!this.authService.checkPermission('/dictionary', 'EDIT_DICTIONARY')) {
      return;
    }
    this.addOrEdit(item);
  }

  addOrEdit(item: IDataItemGetByTypeDictionary) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmDictionaryAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: item ? `Sửa danh mục con` : 'Thêm danh mục con',
      nzContent: BmDictionaryAddEditComponent,
      nzContentParams: {
        dictionary: item,
        modeEdit: item ? true : false,
        parent: this.dictionary
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (item) {
          Object.assign(item, data);
          return;
        }
        this.listDictionaryChild = [data, ...this.listDictionaryChild];
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
    this.getListDictionaryChild();
  }

  async handlerActiveChange(event: boolean, item: IDataItemGetByTypeDictionary) {
    if (!this.authService.checkPermission('/dictionary', 'EDIT_DICTIONARY')) {
      setTimeout(() => { item.Active = !event }, 0);
      return;
    }
    this.keyToggleLoading = item.Id;
    try {
      const body = {
        ...item,
        Active: event
      };
      const result = await this.dictionaryService.updateTypeDictionary(body);
      if (result.success) {
        item.Active = event;
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

  async handlerDeleteDictionary(id: string) {
    if (!this.authService.checkPermission('/dictionary', 'DELETE_DICTIONARY')) {
      return;
    }
    try {
      const result = await this.dictionaryService.deleteTypeDictionaryByType(id);
      if (result.success) {
        this.listDictionaryChild = this.listDictionaryChild.filter(element => element.Id !== id);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
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

  handlerDeleteListDictionary(event: Event) {
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
