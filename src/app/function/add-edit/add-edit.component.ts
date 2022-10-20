import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { IFunction } from 'src/app/lib/services/function/interfaces/function.interface';
import { IRoom } from 'src/app/lib/services/room/interfaces/room.interface';
import { RoomService } from 'src/app/lib/services/room/room.service';

@Component({
  selector: 'bm-function-add-edit',
  templateUrl: './add-edit.component.html'
})
export class BmFunctionAddEditComponent implements OnInit {

  meetingRoomForm: FormGroup;
  loading: boolean;

  @Input() function: IFunction;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IRoom>();

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private toast: ToastrService
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.meetingRoomForm = this.fb.group({
      // Name: [this.room?.Name || '', [Validators.required]],
      // AmountSlot: [this.room?.AmountSlot || null, [Validators.required]],
      // Description: [this.room?.Description || ''],
      // Code: [this.room?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      // Active: [this.room?.Active || true]
    });
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.meetingRoomForm.valid) {
      Object.values(this.meetingRoomForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.meetingRoomForm.value,
      Domain: ConstantDefines.DOMAIN
    }
    if (this.modeEdit) {
      body.Id = this.function.Id;
    }
    try {
      const result = await this.roomService[this.modeEdit ? 'updateRoom' : 'createRoom'](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.function.Id });
        this.toast.success('i18n_notification_manipulation_success');
        return;
      }
      this.toast.error(result.message || 'i18n_notification_manipulation_not_success');
    } catch (error) {
      this.toast.error('i18n_notification_manipulation_not_success');
    } finally {
      this.loading = false;
    }
  }

}
