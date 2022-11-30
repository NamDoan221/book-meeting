import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { DictionaryService } from 'src/app/lib/services/dictionary/dictionary.service';
import { IDataItemGetByTypeDictionary, IDictionaryItem } from 'src/app/lib/services/dictionary/interfaces/dictionary.interface';
import { IMeetingRoom } from 'src/app/lib/services/meeting-room/interfaces/room.interface';

@Component({
  selector: 'bm-dictionary-add-edit',
  templateUrl: './add-edit.component.html'
})
export class BmDictionaryAddEditComponent implements OnInit {

  dictionaryForm: FormGroup;
  loading: boolean;

  @Input() dictionary: IDictionaryItem | IDataItemGetByTypeDictionary;
  @Input() modeEdit: boolean;
  @Input() parent: IDictionaryItem;

  @Output() saveSuccess = new EventEmitter<IMeetingRoom>();

  constructor(
    private fb: FormBuilder,
    private dictionaryService: DictionaryService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.dictionaryForm = this.fb.group({
      Name: [this.dictionary?.Name || '', [Validators.required]],
      Description: [this.dictionary?.Description || ''],
      Code: [this.dictionary?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      Active: [this.dictionary?.Active || true]
    });
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.dictionaryForm.valid) {
      Object.values(this.dictionaryForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.dictionaryForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.dictionary.Id;
    }
    if (this.parent) {
      body.IdDictionaryType = this.parent.Id;
    }
    const functionCall = !this.parent ? this.modeEdit ? 'updateTypeDictionary' : 'createTypeDictionary' : this.modeEdit ? 'updateTypeDictionaryByType' : 'createTypeDictionaryByType';
    try {
      const result = await this.dictionaryService[functionCall](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.dictionary.Id });
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
