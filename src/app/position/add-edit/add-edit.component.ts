import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { DepartmentService } from 'src/app/lib/services/department/department.service';
import { IDepartment, IParamsGetListDepartment } from 'src/app/lib/services/department/interfaces/department.interface';
import { DictionaryService } from 'src/app/lib/services/dictionary/dictionary.service';
import { IDataItemGetByTypeDictionary } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { IPosition } from 'src/app/lib/services/position/interfaces/position.interface';
import { PositionService } from 'src/app/lib/services/position/position.service';

@Component({
  selector: 'bm-position-add_edit',
  templateUrl: './add-edit.component.html'
})
export class BmPositionAddEditComponent implements OnInit {

  positionForm: FormGroup;
  loading: boolean;
  loadingDepartment: boolean;
  firstCallDepartment: boolean;
  listPositionLevel: IDataItemGetByTypeDictionary[];
  totalDepartment: number;
  listDepartment: IDepartment[];
  paramsGetDepartment: IParamsGetListDepartment;
  onSearchDepartment: Subject<string> = new Subject();

  @Input() position: IPosition;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IPosition>();

  constructor(
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
    private dictionaryService: DictionaryService,
    private positionService: PositionService,
    private departmentService: DepartmentService
  ) {
    this.loading = false;
    this.loadingDepartment = true;
    this.listPositionLevel = [];
    this.listDepartment = [];
    this.totalDepartment = 0;
    this.paramsGetDepartment = {
      page: 1,
      pageSize: 20,
      search: '',
      active: true
    }
    this.firstCallDepartment = true;
  }

  ngOnInit(): void {
    this.positionForm = this.fb.group({
      Name: [this.position?.Name || '', [Validators.required]],
      IdLevel: [this.position?.IdLevel || 'null', [Validators.required]],
      IdDepartment: [this.position?.IdDepartment || 'null', [Validators.required]],
      Description: [this.position?.Description || ''],
      Code: [this.position?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      Active: [this.position?.Active || true]
    });
    this.getListPositionLevel();
    this.onSearchDepartment.pipe(debounceTime(500), filter(value => value !== this.paramsGetDepartment.search)).subscribe((value) => {
      this.searchDepartment(value);
    });
    this.getListDepartment();
  }

  async getListPositionLevel() {
    try {
      const result = await this.dictionaryService.getListDataByTypeDictionary('POSITION_LEVEL');
      this.listPositionLevel = result;
    } catch (error) {
      console.log(error);
    }
  }

  handlerSearchDepartment(event: string) {
    this.paramsGetDepartment.page = 1;
    this.onSearchDepartment.next(event);
  }

  handlerScrollBottom() {
    if (this.loadingDepartment || !this.totalDepartment || this.totalDepartment <= this.listDepartment.length) {
      return;
    }
    this.paramsGetDepartment.page += 1;
    this.getListDepartment();
  }

  searchDepartment(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetDepartment.search : (this.paramsGetDepartment.search = text);
    this.listDepartment = [];
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
    }
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.positionForm.valid) {
      Object.values(this.positionForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.positionForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.position.Id;
    }
    try {
      const result = await this.positionService[this.modeEdit ? 'updatePosition' : 'createPosition'](body);
      if (result.success) {
        const levelName = this.listPositionLevel.find(item => item.Id === body.IdLevel)?.Name;
        const departmentName = this.listDepartment.find(item => item.Id === body.IdDepartment)?.Name;
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.position.Id, LevelName: levelName, DepartmentName: departmentName });
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

}
