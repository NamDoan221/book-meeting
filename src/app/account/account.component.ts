import { Component, OnInit } from '@angular/core';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ToastrService } from 'ngx-toastr';
import { AccountRegister } from '../shared/services/api/account';
import { AuthService } from '../shared/services/auth.service';
import { PassWord } from './api/password';

function getBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

@Component({
  selector: 'hn-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class HnAccountComponent implements OnInit {

  public account: AccountRegister;
  public tempAccount: AccountRegister;
  public password: PassWord;
  public oldPasswordVisible: boolean;
  public newPasswordVisible: boolean;
  public reNewPasswordVisible: boolean;
  fileList: NzUploadFile[] = [];
  constructor(
    private auth: AuthService,
    private toast: ToastrService
  ) {
    this.password = {
      old_password: '',
      new_password: '',
      renew_password: ''
    };
    this.oldPasswordVisible = false;
    this.newPasswordVisible = false;
    this.reNewPasswordVisible = false;

  }

  ngOnInit(): void {
    this.account = this.auth.getAccountLocalStorage();
    this.tempAccount = {...this.account};
  }

  changeAvatar(event): void {
    console.log(1, event);
    this.fileList = [];
  }

  async changePassword(): Promise<void> {
    if (this.password.new_password !== this.password.renew_password) {
      this.toast.warning('Mật khẩu mới không trùng khớp!');
      return;
    }
    try {
      await this.auth.changePassword(this.password);
      this.toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      this.toast.error('Đổi mật khẩu thất bại!');
      console.log(error);
    }
  }

  async changeInfo(): Promise<void> {
    try {
      const result = await this.auth.changeInfo(this.account);
      this.tempAccount = {...result};
      this.auth.setAccountLocalStorage(result);
      this.toast.success('Thay đổi thông tin thành công!');
    } catch (error) {
      this.toast.error('Thay đổi thông tin thất bại!');
      console.log(error);
    }
  }

  changeViewPass(type: string): void {
    switch (type) {
      case 'oldPassword':
        this.oldPasswordVisible = !this.oldPasswordVisible;
        break;
      case 'newPassword':
        this.newPasswordVisible = !this.newPasswordVisible;
        break;
      case 'reNewPassword':
        this.reNewPasswordVisible = !this.reNewPasswordVisible;
        break;
      default:
        break;
    }
  }

}
