import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { AuthService } from '../lib/services/auth.service';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BmPersonnelAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.scss']
})
export class BmPersonnelComponent implements OnInit {
  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listPersonnel: any[];
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
      'Họ và tên',
      'Địa chỉ',
      'Giới tính',
      'Số điện thoại',
      'Phòng ban',
      'Chức vụ'
    ];
  }

  ngOnInit(): void {
  }

  getListPersonnel(params: any) {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Nguyễn Văn A${i}`,
        address: `Vị trí A${i}`,
        gender: i / 2 ? 'Nam' : 'Nữ',
        phone_number: `0984333${i < 10 ? '0' + i : i}`,
        department: `Phòng ban ${i}`,
        position: `Chức vụ ${i}`
      });
    }
    this.listPersonnel = data;
  }

  handlerAddPersonnel(event: Event) {
    event.stopPropagation();
    this.addOrEdit(undefined);
  }

  handlerEditPersonnel(event: Event, item: any) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  addOrEdit(personnel: any) {
    if (this.isOpenDraw) {
      return;
    }
    this.isOpenDraw = true;
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
      this.isOpenDraw = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe(data => {
        this.isOpenDraw = false;
        this.drawerRefGlobal.close();
        if (personnel) {
          Object.assign(personnel, data);
          return;
        }
        this.listPersonnel = [data, ...this.listPersonnel];
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
    this.getListPersonnel(param)
  }
}
