import { Component, Input, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'bm-department-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class BmDepartmentMemberComponent implements OnInit {

  columnConfig: string[];
  loading: boolean;
  pageSize: number;
  total: number;
  pageIndexGroup: number;
  listMember: any[];

  @Input() id_department: string;

  constructor() {
    this.loading = false;
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.columnConfig = ['Họ và tên', 'Chức vụ'];
  }

  ngOnInit(): void {
  }

  getListMemberByDepartmentId(param: any) {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        name: `Nguyễn Văn A ${i}`,
        regency: `Nhân viên ${i}`
      });
    }
    this.listMember = data;
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
    this.getListMemberByDepartmentId(param)
  }
}
