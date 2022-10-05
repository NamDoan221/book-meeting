import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ToastrService } from 'ngx-toastr';
import { ConstantDefines } from '../lib/defines/constant.define';
import { AuthService } from '../lib/services/auth.service';
import { IPassWord } from './interfaces/password.interfaces';
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

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastrService
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
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required]],
      renew_password: ['', [Validators.required, this.confirmationValidator]]
    });
    this.accountForm = this.fb.group({
      accountId: [{ value: '', disabled: true }, [Validators.required]],
      accountName: [{ value: '', disabled: true }, [Validators.required]],
      userName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(11)]]
    });
  }

  async ngOnInit(): Promise<void> {
    console.log(12);

    const accountFromCache = this.auth.getAccountFromCache();
    if (!accountFromCache) {
      return;
    }
    try {
      const result = await this.auth.getAccount(ConstantDefines.DOMAIN, accountFromCache.Id);
      this.accountForm.setValue(result)
      this.tempAccount = { ...result };
    } catch (error) {
      console.log(error);
    }
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    }
    if (control.value !== this.passwordForm.controls.new_password.value) {
      return { confirm: true, error: true };
    }
  }

  handlerChangeAvatar(event): void {
    console.log(1, event);
    this.fileList = [];
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
      // await this.auth.changePassword(this.password);
      this.toast.success('i18n_notification_manipulation_success');
    } catch (error) {
      this.toast.error('i18n_notification_manipulation_not_success');
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
    try {
      // const result = await this.auth.changeInfo(this.account);
      // this.tempAccount = { ...result };
      // this.auth.setAccountLocalStorage(result);
      this.toast.success('i18n_notification_manipulation_success');
    } catch (error) {
      this.toast.error('i18n_notification_manipulation_not_success');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerCancel() {

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
    this.passwordForm.get('new_password').setValue(passwordRandom);
    this.passwordForm.get('renew_password').setValue(passwordRandom);
  }

  handlerChangeModeUpdatePass() {
    this.modeUpdatePass = true;
  }

  handlerCancelChangePass() {
    this.modeUpdatePass = false;
  }

}
