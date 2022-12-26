import { Component, OnInit } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { DragulaService } from 'ng2-dragula';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { TabsDefault } from '../lib/defines/tab.define';
import { AttendanceTypeService } from '../lib/services/attendance-type/attendance-type.service';
import { IAttendanceType, IParamsGetListAttendanceType } from '../lib/services/attendance-type/interfaces/attendance-type.interface';
import { AuthService } from '../lib/services/auth/auth.service';
import { DepartmentService } from '../lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from '../lib/services/department/interfaces/department.interface';
import { BmAttendanceTypeAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-attendance_type',
  templateUrl: './attendance-type.component.html'
})
export class BmAttendanceTypeComponent implements OnInit {
  loading: boolean;
  listAttendanceType: IAttendanceType[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;
  params: IParamsGetListAttendanceType;
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
    private attendanceTypeService: AttendanceTypeService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private dragulaService: DragulaService
  ) {
    this.loading = false;
    this.isOpenDraw = false;
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
    this.dragulaService.dragend('index').subscribe(() => {
      console.log(this.listAttendanceType);
    });
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchAttendanceType(value);
    });
    this.getListAttendanceType();
  }

  searchAttendanceType(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listAttendanceType = [];
    this.getListAttendanceType();
  }

  async getListAttendanceType() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.attendanceTypeService.getListAttendanceType(this.params);
      this.listAttendanceType = result.Value;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddAttendanceType(event: Event) {
    event.stopPropagation();
    if (!this.authService.checkPermission('/attendance-type', 'ADD_ATTENDANCE_TYPE')) {
      return;
    }
    this.addOrEdit(undefined);
  }

  handlerEditAttendanceType(event: Event, item: IAttendanceType) {
    event.stopPropagation();
    if (!this.authService.checkPermission('/attendance-type', 'EDIT_ATTENDANCE_TYPE')) {
      return;
    }
    this.addOrEdit(item);
  }

  addOrEdit(attendanceType: IAttendanceType) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmAttendanceTypeAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: attendanceType ? `Sửa kiểu người tham gia` : 'Thêm kiểu người tham gia',
      nzContent: BmAttendanceTypeAddEditComponent,
      nzContentParams: {
        attendanceType: attendanceType,
        modeEdit: attendanceType ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (attendanceType) {
          Object.assign(attendanceType, data);
          return;
        }
        this.listAttendanceType = [data, ...this.listAttendanceType];
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
      this.searchAttendanceType(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerActiveChange(event: boolean, item: IAttendanceType) {
    if (!this.authService.checkPermission('/attendance-type', 'EDIT_ATTENDANCE_TYPE')) {
      setTimeout(() => { item.Active = !event }, 0);
      return;
    }
    this.keyToggleLoading = item.Id;
    try {
      const result = await this.attendanceTypeService.changeStatusAttendanceType(item.Id);
      if (result.success) {
        item.Active = event;
        this.listAttendanceType = this.listAttendanceType.filter(element => element.Id !== item.Id);
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
    this.getListAttendanceType();
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

  handlerDeleteAttendanceType(event: Event) {
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
