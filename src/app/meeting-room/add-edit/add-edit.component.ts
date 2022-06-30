import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'bm-meeting-room-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BmMeetingRoomAddEditComponent implements OnInit {

  meetingRoomForm: FormGroup;
  loading: boolean;

  @Input() room: any;
  @Input() modeEdit: boolean;

  @Output() saveSuccess = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder
  ) {
    this.loading = false;
  }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.meetingRoomForm = this.fb.group({
      name: [this.room?.name || '', [Validators.required]],
      maximum_capacity: [this.room?.maximum_capacity || null, [Validators.required]],
      description: [this.room?.description || '']
    });
  }

  handlerScrollBottom(event: any) {

  }

  handlerUpdate(event: Event) {
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
    this.saveSuccess.emit(this.meetingRoomForm.value);
  }

}
