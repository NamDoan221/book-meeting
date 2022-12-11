import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { AuthService } from '../lib/services/auth/auth.service';
import { IParamsConnectGoogle, IToken } from '../lib/services/auth/interfaces/auth.interfaces';
import jwt_decode from "jwt-decode";
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
  tempAccount: IToken;
  currentPasswordVisible: boolean;
  newPasswordVisible: boolean;
  reNewPasswordVisible: boolean;
  fileList: NzUploadFile[] = [];
  modeUpdatePass: boolean;

  @ViewChild('elInputFile') inputFile!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private nzMessageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.modeUpdatePass = false;
    this.currentPasswordVisible = false;
    this.newPasswordVisible = false;
    this.reNewPasswordVisible = false;
    this.tempAccount = {
      AvatarUrl: '',
      FullName: ''
    }
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required, this.confirmationValidator]]
    });
  }

  async ngOnInit() {
    const accountFromCache = this.authService.decodeToken();
    this.accountForm = this.fb.group({
      Email: [accountFromCache.Email || '', [Validators.required, Validators.email]],
      FullName: [accountFromCache.FullName || '', [Validators.required]],
      Phone: [{ value: accountFromCache.Phone || '', disabled: true }, [Validators.required, Validators.pattern('^(0|84)([0-9]{9})$')]] //^(0|(\+?84))([0-9]{9})$
    });
    this.tempAccount = { ...accountFromCache };
    this.activatedRoute.queryParams.subscribe((res: Params) => {
      if (res['success']) {
        const dataGoogle = jwt_decode(res['success']);
        this.tempAccount.Email = dataGoogle['Email'];
        this.tempAccount.GGAvatarUrl = dataGoogle['GGAvatarUrl'];
        this.tempAccount.IsConnectedGG = true;
        this.authService.setToken(JSON.stringify(this.tempAccount));
        this.nzMessageService.success('Kết nối thành công');
        this.router.navigate['/account'];
      }
      if (res['error']) {
        this.nzMessageService.error('Kết nối thất bại');
        this.router.navigate['/account'];
      }
    });
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
      await this.authService.changeAvatar(this.tempAccount.Id, 'http://genk.mediacdn.vn/2016/best-photos-2016-natgeo-national-geographic-7-5846f70467192-880-1481173142742.jpg');
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
      await this.authService.changePassword(this.tempAccount.Id, body);
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
    if (!this.authService.checkPermission('/account', 'EDIT_INFO')) {
      return;
    }
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
      const result = await this.authService.changeInfo(body, this.tempAccount.Id);
      this.tempAccount = { ...body };
      this.authService.setToken(JSON.stringify(this.tempAccount));
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
    if (!this.authService.checkPermission('/account', 'EDIT_INFO')) {
      return;
    }
    this.modeUpdatePass = true;
  }

  handlerCancelChangePass() {
    this.modeUpdatePass = false;
  }

  async handlerConnect() {
    const params: IParamsConnectGoogle = {
      idUser: this.tempAccount.Id,
      callbackUri: `${window.origin}${this.router.url}`
    }
    try {
      const result = await this.authService.connectGoogle(params);
      window.open(result, '_blank');
    } catch (error) {
      console.log(error);
    }
  }

  handlerDeleteConnect() {
    console.log('handlerDeleteConnect');
  }
}
