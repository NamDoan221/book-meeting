import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { convertFileToBase64 } from '../lib/defines/function.define';
import { AuthService } from '../lib/services/auth/auth.service';
import { PersonnelService } from '../lib/services/personnel/personnel.service';

@Component({
  selector: 'bm-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class BmAccountComponent implements OnInit {

  accountForm: FormGroup;
  passwordForm: FormGroup;
  loading: boolean;
  loadingChangePass: boolean;
  tempAccount: any;
  currentPasswordVisible: boolean;
  newPasswordVisible: boolean;
  reNewPasswordVisible: boolean;
  fileList: NzUploadFile[] = [];
  modeUpdatePass: boolean;

  @ViewChild('elInputFile') inputFile!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nzMessageService: NzMessageService,
    private personnelService: PersonnelService
  ) {
    this.modeUpdatePass = false;
    this.currentPasswordVisible = false;
    this.newPasswordVisible = false;
    this.reNewPasswordVisible = false;
    this.tempAccount = {
      avatar: '',
      name: ''
    }
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, this.confirmationValidator]]
    });
  }

  async ngOnInit() {
    const accountFromCache = this.auth.decodeToken();
    this.accountForm = this.fb.group({
      Username: [{ value: accountFromCache.Username || '', disabled: true }, [Validators.required]],
      Email: [accountFromCache.Email || '', [Validators.required, Validators.email]],
      FullName: [accountFromCache.FullName || '', [Validators.required]],
      Phone: [accountFromCache.Phone || '', [Validators.required, Validators.pattern('^(0|84)([0-9]{9})$')]] //^(0|(\+?84))([0-9]{9})$
    });
    this.tempAccount = { ...accountFromCache };
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    }
    if (control.value !== this.passwordForm.controls.newPassword.value) {
      return { confirm: true, error: true };
    }
  }

  handlerChangeAvatar() {
    this.inputFile.nativeElement.click();
  }

  async handlerChangeInputFile(event: any) {
    // console.log(event.target.files);
    // const url = await convertFileToBase64(event.target.files[0]);
    // console.log(url);
    try {
      await this.auth.changeAvatar(this.tempAccount.Id, 'http://genk.mediacdn.vn/2016/best-photos-2016-natgeo-national-geographic-7-5846f70467192-880-1481173142742.jpg');
      this.nzMessageService.success('Thao tác thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
      console.log(error);
    }
  }

  async handlerChangePassword(): Promise<void> {
    if (this.loadingChangePass) {
      return;
    }
    if (!this.passwordForm.valid) {
      for (const i in this.passwordForm.controls) {
        this.passwordForm.controls[i].markAsDirty();
        this.passwordForm.controls[i].updateValueAndValidity();
      }
      return;
    }
    this.loadingChangePass = true;
    try {
      const body = this.passwordForm.value;
      delete body.confirmPassword;
      await this.auth.changePassword(this.tempAccount.Id, body);
      this.nzMessageService.success('Thao tác thành công.');
      this.modeUpdatePass = false;
      this.passwordForm.reset();
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
      console.log(error);
    } finally {
      this.loadingChangePass = false;
    }
  }

  async handlerChangeInfo(): Promise<void> {
    if (this.loading) {
      return;
    }
    if (!this.accountForm.valid) {
      for (const i in this.accountForm.controls) {
        this.accountForm.controls[i].markAsDirty();
        this.accountForm.controls[i].updateValueAndValidity();
      }
      return;
    }
    this.loading = true;
    const body = {
      ...this.tempAccount,
      ...this.accountForm.value
    }
    try {
      const result = await this.auth.changeInfo(body, this.tempAccount.Id);
      this.tempAccount = { ...body };
      this.auth.setToken(JSON.stringify(this.tempAccount));
      this.nzMessageService.success('Thao tác thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerCancel() {
    this.accountForm.setValue({
      Username: this.tempAccount.Username ?? '',
      Email: this.tempAccount.Email ?? '',
      FullName: this.tempAccount.FullName ?? '',
      Phone: this.tempAccount.Phone ?? ''
    });
    for (const i in this.accountForm.controls) {
      this.accountForm.controls[i].setErrors(undefined);
    }
  }

  handlerChangeViewPass(type: string): void {
    switch (type) {
      case 'currentPassword':
        this.currentPasswordVisible = !this.currentPasswordVisible;
        break;
      case 'newPassword':
        this.newPasswordVisible = !this.newPasswordVisible;
        break;
      case 'reNewPassword':
        this.reNewPasswordVisible = !this.reNewPasswordVisible;
        break;
    }
  }

  handlerRandomPassword(event: Event) {
    event.stopPropagation();
    const passwordRandom = Math.random().toString(36).substring(6);
    this.passwordForm.get('newPassword').setValue(passwordRandom);
    this.passwordForm.get('confirmPassword').setValue(passwordRandom);
  }

  handlerChangeModeUpdatePass() {
    this.modeUpdatePass = true;
  }

  handlerCancelChangePass() {
    this.modeUpdatePass = false;
  }

}
