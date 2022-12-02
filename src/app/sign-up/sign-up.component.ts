import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from '../lib/defines/constant.define';
import { AuthService } from '../lib/services/auth/auth.service';
import { IBodyRegisterAccount } from '../lib/services/auth/interfaces/auth.interfaces';

@Component({
  selector: 'bm-sign_up',
  templateUrl: './sign-up.component.html'
})
export class BmSignUpComponent {
  public signUpForm: FormGroup;
  public passwordVisible: boolean;
  public passwordRetypeVisible: boolean;
  public loading: boolean;
  public phoneValid: boolean;
  public emailValid: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private nzMessageService: NzMessageService,
    private fb: FormBuilder,
  ) {
    this.loading = false;
    this.passwordVisible = false;
    this.passwordRetypeVisible = false;
    this.signUpForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      address: [''],
      phone: ['', [Validators.required, Validators.pattern('^(0|84)([0-9]{9})$')]],
      avatarUrl: [''],
      gender: [0, [Validators.required]],
      dob: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordRetype: ['', [Validators.required, this.confirmationValidator]]
    });
  }

  handlerLogin() {
    this.router.navigate(['/login']);
  }

  async handlerCheckAccountExist(type: string) {
    try {
      const data = {
        phone: this.signUpForm.value.phone,
        email: this.signUpForm.value.email
      };
      const result = await this.auth.checkExistAccount(data);
      type === 'email' ? this.emailValid = result.isEmail : this.phoneValid = result.isPhone;
    } catch (error) {
      console.log(error);
    }
  }

  async handlerSignUp(): Promise<any> {
    if (!this.signUpForm.valid) {
      Object.values(this.signUpForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    try {
      const user: IBodyRegisterAccount = this.signUpForm.value;
      delete user.passwordRetype;
      user.domain = ConstantDefines.DOMAIN;
      const result = await this.auth.register(user);
      if (!result.success) {
        this.nzMessageService.error(result.message ?? 'Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
        return;
      }
      this.nzMessageService.success('Tạo tài khoản thành công!');
      this.router.navigate(['/login']);
    } catch (error) {
      this.nzMessageService.error('Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    }
    if (control.value !== this.signUpForm.controls.password.value) {
      return { confirm: true, error: true };
    }
  }

  handlerChangeViewPassword(type: string): void {
    if (type === 'password') {
      this.passwordVisible = !this.passwordVisible;
      return;
    }
    this.passwordRetypeVisible = !this.passwordRetypeVisible;
  }

}
