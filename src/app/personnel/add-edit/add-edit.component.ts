import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { AuthService } from 'src/app/lib/services/auth/auth.service';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from 'src/app/lib/services/department/interfaces/department.interface';
import { IPersonnel } from 'src/app/lib/services/personnel/interfaces/personnel.interface';
import { PersonnelService } from 'src/app/lib/services/personnel/personnel.service';
import { IParamsGetListPosition, IPosition } from 'src/app/lib/services/position/interfaces/position.interface';
import { PositionService } from 'src/app/lib/services/position/position.service';
import { Tabs } from '../defines/data.define';

@Component({
  selector: 'bm-personnel-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BmPersonnelAddEditComponent implements OnInit {

  personnelForm: FormGroup;
  loading: boolean;
  listMeeting: any[];
  tabs: Array<any>;
  selectedTab: number;
  columnConfig: string[];
  totalPosition: number;
  listPosition: IPosition[];
  onSearchPosition: Subject<string> = new Subject();
  paramsGetPosition: IParamsGetListPosition;
  loadingPosition: boolean;
  firstCallPosition: boolean;
  passwordVisible: boolean;
  passwordRetypeVisible: boolean;

  pageSize: number;
  total: number;
  pageIndexGroup: number;

  totalDepartment: number;
  listDepartment: IDepartment[];
  onSearchDepartment: Subject<string> = new Subject();
  paramsGetDepartment: IParamsGetListDepartment;
  firstCallDepartment: boolean;
  loadingDepartment: boolean;

  @Input() personnel: IPersonnel;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IPersonnel>();

  constructor(
    private fb: FormBuilder,
    private personnelService: PersonnelService,
    private positionService: PositionService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private departmentService: DepartmentService
  ) {
    this.total = 2;
    this.pageSize = 20;
    this.pageIndexGroup = 1;
    this.loading = false;
    this.listPosition = [];
    this.selectedTab = 0;
    this.tabs = Tabs();
    this.columnConfig = [
      'Tên cuộc họp',
      'Thời gian diễn ra',
      'Số người tham gia',
      'Mô tả cuộc họp'
    ];
    this.paramsGetPosition = {
      page: 1,
      pageSize: 20,
      search: '',
      active: true
    }
    this.loadingPosition = true;
    this.firstCallPosition = true;

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

  ngOnInit(): void {
    this.personnelForm = this.fb.group({
      FullName: [this.personnel?.FullName ?? '', [Validators.required]],
      AvatarUrl: [this.personnel?.AvatarUrl ?? ''],
      Dob: [this.personnel?.Dob ?? '', [Validators.required]],
      Address: [this.personnel?.Address ?? '', [Validators.required]],
      Gender: [this.personnel?.Gender ?? 0, [Validators.required]],
      Phone: [this.personnel?.Phone ?? '', [Validators.required, Validators.pattern('^(0|84)([0-9]{9})$')]],
      IdPosition: [this.personnel?.IdPosition ?? '', [Validators.required]],
      Active: [this.personnel?.Active ?? true, [Validators.required]]
    });
    this.onSearchPosition.pipe(debounceTime(500), filter(value => value !== this.paramsGetPosition.search)).subscribe((value) => {
      this.searchPosition(value);
    });
    this.getListPosition();
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListDepartment();
  }

  handlerSearchPosition(event: string) {
    this.paramsGetPosition.page = 1;
    this.onSearchPosition.next(event);
  }

  handlerScrollBottom() {
    if (this.loadingPosition || !this.totalPosition || this.totalPosition <= this.listPosition.length) {
      return;
    }
    this.paramsGetPosition.page += 1;
    this.getListPosition();
  }

  searchPosition(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetPosition.search : (this.paramsGetPosition.search = text);
    this.listPosition = [];
    this.getListPosition();
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
      this.listPosition.push(...result.Value);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingPosition = false;
    }
  }

  handlerChangeViewPassword(type: string): void {
    if (type === 'password') {
      this.passwordVisible = !this.passwordVisible;
      return;
    }
    this.passwordRetypeVisible = !this.passwordRetypeVisible;
  }

  handlerTabChange(event) {
    this.selectedTab = event.index;
  }

  handlerQueryParamsChange(event) {

  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
      return;
    }
    if (!this.personnelForm.valid) {
      Object.values(this.personnelForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.personnelForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    !body.AvatarUrl && delete body.AvatarUrl;
    delete body.ConfirmPassword;
    if (this.modeEdit) {
      !body.Password && delete body.Password;
      body.Id = this.personnel.Id;
    }
    try {
      const result = await this.personnelService[this.modeEdit ? 'updatePersonnel' : 'createPersonnel'](body);
      if (result.success) {
        const positionName = this.listPosition.find(item => item.Id === body.IdPosition)?.Name;
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.personnel.Id, PositionName: positionName });
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
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
    this.paramsGetPosition.idDepartment = event;
    this.listPosition = [];
    this.personnelForm.get('IdPosition').reset();
    this.getListPosition();
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
}
