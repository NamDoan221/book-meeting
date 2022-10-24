import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from 'src/app/lib/defines/constant.define';
import { IRoom } from 'src/app/lib/services/room/interfaces/room.interface';
import { RoomService } from 'src/app/lib/services/room/room.service';

@Component({
  selector: 'bm-meeting-room-add-edit',
  templateUrl: './add-edit.component.html'
})
export class BmMeetingRoomAddEditComponent implements OnInit {

  meetingRoomForm: FormGroup;
  loading: boolean;

  @Input() room: IRoom;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<IRoom>();

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.meetingRoomForm = this.fb.group({
      Name: [this.room?.Name || '', [Validators.required]],
      AmountSlot: [this.room?.AmountSlot || null, [Validators.required]],
      Description: [this.room?.Description || ''],
      Code: [this.room?.Code || '', [Validators.required, Validators.pattern('^([0-9A-Z])+(\_?([0-9A-Z]))+$')]],
      Active: [this.room?.Active || true]
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
      body.Id = this.room.Id;
    }
    try {
      const result = await this.roomService[this.modeEdit ? 'updateRoom' : 'createRoom'](body);
      if (result.success) {
        this.saveSuccess.emit({ ...body, Id: result.result ?? this.room.Id });
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
