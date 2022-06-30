import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from '../lib/services/auth.service';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BmDepartmentMemberComponent } from './member/member.component';
import { BmDepartmentAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class BmDepartmentComponent implements OnInit {
  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listDepartment: any[];
  columnConfig: string[];
  isOpenDraw: boolean;
  drawerRefGlobal: NzDrawerRef;

  constructor(
    private auth: AuthService,
    private drawerService: NzDrawerService,
    private notification: NzNotificationService
  ) {
    this.loading = false;
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.isOpenDraw = false;
    this.columnConfig = [
      'Tên nhóm',
      'Trưởng nhóm',
      'Thành viên',
      'Mô tả công việc'
    ];
  }

  ngOnInit(): void {
  }

  getListDepartment(params: any) {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Nhân sự ${i}`,
        manager: `Nguyễn Văn A${i}`,
        description: `Lam viec ${i}`,
        member: []
      });
    }
    this.listDepartment = data;
  }

  handlerAddDepartment(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditDepartment(event: Event, item: any) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(department: any) {
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
    if (!params) {
      return;
    }
    this.pageIndexGroup = params.pageIndex;
    this.pageSize = params.pageSize;
    let param = {
      page: this.pageIndexGroup,
      limit: this.pageSize
    }
    this.getListDepartment(param)
  }

  handlerViewMember(event: Event, id_department: string) {
    event.stopPropagation();
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
    this.drawerRefGlobal = this.drawerService.create<BmDepartmentMemberComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '40vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: `Danh sách nhân viên thuộc phòng ${id_department}`,
      nzContent: BmDepartmentMemberComponent,
      nzContentParams: {
        id_department: id_department
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDraw = true;
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDraw = false;
      this.drawerRefGlobal.close();
    });
  }
}
