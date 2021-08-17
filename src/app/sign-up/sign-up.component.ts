import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountRegister } from '../shared/services/api/account';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'hn-sign_up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class HnSignUpComponent implements OnInit {
  public user: AccountRegister;
  public passwordVisible: boolean;
  public rePasswordVisible: boolean;
  public onRegister: boolean;
  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService
  ) {
    this.onRegister = false;
    this.passwordVisible = false;
    this.user = {
      email: '',
      name: '',
      password: '',
      rePassword: '',
      avatar: '',
      phone: ''
    };
  }

  ngOnInit(): void {
  }

  handlerLogin(): any {
    this.router.navigate(['/login']);
  }

  async handlerSignUp(): Promise<any> {
    if (this.user.password !== this.user.rePassword) {
      this.toast.warning('Mật khẩu không trùng khớp!');
      return;
    }
    this.onRegister = true;
    try {
      await this.auth.register(this.user);
      this.toast.success('Tạo tài khoản thành công!');
      this.router.navigate(['/login']);
    } catch (error) {
      this.onRegister = false;
      this.toast.error('Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
      console.log(error);
    }
  }

  changeViewPass(type: string): void {
    if (type === 'password') {
      this.passwordVisible = !this.passwordVisible;
      return;
    }
    this.rePasswordVisible = !this.rePasswordVisible;
  }

}
