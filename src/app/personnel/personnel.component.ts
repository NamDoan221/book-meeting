import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { ITab } from '../lib/interfaces/tab.interface';
import { IColumnItem } from '../lib/interfaces/table.interfaces';
import { DataFaceService } from '../lib/services/dataface/dataface.service';
import { IParamsGetListPersonnel, IPersonnel } from '../lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from '../lib/services/personnel/personnel.service';
import { IParamsGetListPosition, IPosition } from '../lib/services/position/interfaces/position.interface';
import { PositionService } from '../lib/services/position/position.service';
import { BmPersonnelAddEditComponent } from './add-edit/add-edit.component';
import * as uuid from 'uuid';
import { BmPersonnelDataFaceComponent } from './data-face/data-face.component';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { DepartmentService } from '../lib/services/department/department.service';

@Component({
  selector: 'bm-personnel',
  templateUrl: './personnel.component.html'
})
export class BmPersonnelComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  columnConfig: IColumnItem[];
  isOpenDrawAddEdit: boolean;
  isOpenDrawDataFace: boolean;
  drawerRefGlobal: NzDrawerRef;
  keyToggleLoading: string;
  onSearch: Subject<string> = new Subject();
  listPersonnel: IPersonnel[];
  totalPersonnel: number;
  params: IParamsGetListPersonnel;

  totalPosition: number;
  listPosition: IPosition[];
  onSearchPosition: Subject<string> = new Subject();
  paramsGetPosition: IParamsGetListPosition;
  loadingPosition: boolean;
  firstCallPosition: boolean;

  tabs: ITab[];
  selectedTab: number;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<number>();

  keyFetchDataFace: string;

  totalDepartment: number;
  listDepartment: IDepartment[];
  onSearchDepartment: Subject<string> = new Subject();
  paramsGetDepartment: IParamsGetListDepartment;
  firstCallDepartment: boolean;
  loadingDepartment: boolean;

  constructor(
    private drawerService: NzDrawerService,
    private positionService: PositionService,
    private nzMessageService: NzMessageService,
    private personnelService: PersonnelService,
    private dataFaceService: DataFaceService,
    private departmentService: DepartmentService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.totalPersonnel = 0;
    this.totalPosition = 0;
    this.isOpenDrawAddEdit = false;
    this.isOpenDrawDataFace = false;
    this.columnConfig = [{
      name: 'Họ và tên',
      width: '18%'
    },
    {
      name: 'Giới tính',
      width: '6%'
    },
    {
      name: 'Ngày sinh',
      width: '8%'
    },
    {
      name: 'Địa chỉ',
      width: '18%'
    },
    {
      name: 'Số điện thoại',
      width: '8%'
    },
    {
      name: 'Chức vụ',
      width: '18%'
    },
    {
      name: 'Trạng thái',
      width: '6%'
    }];
    this.listPersonnel = [];
    this.listPosition = [];
    this.loadingPosition = true;
    this.firstCallPosition = true;
    this.paramsGetPosition = {
      page: 1,
      pageSize: 20,
      search: ''
    }
    this.checked = false;
    this.showDelete = false;
    this.params = {
      page: 1,
      pageSize: 20,
      active: true,
      search: ''
    };
    this.selectedTab = 0;
    this.tabs = TabsDefault();

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
      this.searchPersonnel(value);
    });
    this.onSearchPosition.pipe(debounceTime(500), filter(value => value !== this.paramsGetPosition.search)).subscribe((value) => {
      this.searchPosition(value);
    });
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListDepartment();
    this.getListPosition();
    this.getListPersonnel();
  }

  async getListPersonnel() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.personnelService.getListPersonnel(this.params);
      this.totalPersonnel = result.Total;
      this.listPersonnel = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  searchPersonnel(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listPersonnel = [];
    this.firstCall = true;
    this.getListPersonnel();
  }

  searchPosition(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPosition.search : (this.paramsGetPosition.search = text);
    this.listPosition = [];
    this.firstCall = true;
    this.getListPosition();
  }

  handlerSearchPosition(event: string) {
    this.paramsGetPosition.page = 1;
    this.onSearchPosition.next(event);
  }

  async getListPosition() {
    if (this.loadingPosition && !this.firstCallPosition) {
      return;
    }
    this.firstCallPosition = false;
    try {
      this.loadingPosition = true;
      const result = await this.positionService.getListPosition(this.paramsGetPosition);
      this.totalPosition = result.Total;
      this.listPosition = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPosition = false;
    }
  }

  handlerScrollBottomPosition() {
    if (this.loadingPosition || !this.totalPosition || this.totalPosition <= this.listPosition.length) {
      return;
    }
    this.paramsGetPosition.page += 1;
    this.getListPosition();
  }

  handlerSelectPosition() {
    this.firstCall = true;
    this.getListPersonnel();
  }

  handlerAddPersonnel(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditPersonnel(event: Event, item: IPersonnel) {
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

  handlerDeletePersonnel(event: Event) {
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

  addOrEdit(personnel: IPersonnel) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<BmPersonnelAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: personnel ? '90vw' : '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: personnel ? `Sửa thông tin nhân viên` : 'Thêm nhân viên mới',
      nzContent: BmPersonnelAddEditComponent,
      nzContentParams: {
        personnel: personnel,
        modeEdit: personnel ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
        if (personnel) {
          Object.assign(personnel, data);
          return;
        }
        this.listPersonnel = [data, ...this.listPersonnel];
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal.close();
    });
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListPersonnel();
  }

  handlerKeyUp(event) {
    if (this.params.search === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchPersonnel(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerActiveChange(event: boolean, item: IPersonnel) {
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.personnelService.changeStatusPersonnel(item.Id);
      if (result.success) {
        item.Active = event;
        this.listPersonnel = this.listPersonnel.filter(element => element.Id !== item.Id)
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

  async handlerResetPassword(id: string) {
    try {
      const result = await this.personnelService.resetPasswordPersonnel(id);
      if (result.success) {
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  handlerTabChange(event) {
    this.selectedTab = event.index;
    this.params.active = event.index === 0;
    this.firstCall = true;
    this.getListPersonnel();
  }

  handlerAddDataFace(event: Event, personnel: IPersonnel) {
    event.stopPropagation();
    if (this.isOpenDrawDataFace) {
      return;
    }
    this.isOpenDrawDataFace = true;
    this.drawerRefGlobal = this.drawerService.create<BmPersonnelDataFaceComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '50vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: personnel.SpecificHasFace ? `Cập nhật dữ liệu khuôn mặt` : 'Thêm dữ liệu khuôn mặt',
      nzContent: BmPersonnelDataFaceComponent,
      nzContentParams: {
        idPersonnel: personnel.Id,
        modeEdit: personnel.SpecificHasFace
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawDataFace = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDrawDataFace = false;
        this.drawerRefGlobal.close();
        if (data) {
          this.keyFetchDataFace = uuid();
        }
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawDataFace = false;
      this.drawerRefGlobal.close();
    });
  }

  async handlerDeleteDataFace(personnel: IPersonnel) {
    try {
      const result = await this.dataFaceService.deleteDataFace(personnel.Id);
      if (result.success) {
        this.keyFetchDataFace = uuid();
        personnel.SpecificHasFace = false;
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
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
    this.firstCall = true;
    this.paramsGetPosition.idDepartment = event;
    this.params.idPosition = undefined;
    this.getListPosition();
    this.getListPersonnel();
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
