import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ToastrService } from 'ngx-toastr';
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
    private toast: ToastrService,
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
    const accountFromCache = this.auth.getAccountFromCache();
    // try {
    //   const result = await this.personnelService.getPersonnelById(accountFromCache.Id);
    //   console.log(result);

    // } catch (error) {

    // }
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
    console.log('vao');

    this.inputFile.nativeElement.click();
  }

  async handlerChangeInputFile(event: any) {
    console.log(event.target.files);
    try {
      await this.auth.changeAvatar(this.tempAccount.Id, '');
      this.toast.success('i18n_notification_manipulation_success');
    } catch (error) {
      this.toast.error('i18n_notification_manipulation_not_success');
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
    const body = {
      ...this.accountForm.value,
      id: this.tempAccount.Id
    }
    try {
      const result = await this.auth.changeInfo(body);
      this.tempAccount = { ...result };
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
