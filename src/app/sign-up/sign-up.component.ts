import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConstantDefines } from '../lib/defines/constant.define';
import { IBodyRegisterAccount } from '../lib/services/api/account';
import { AuthService } from '../lib/services/auth.service';

@Component({
  selector: 'bm-sign_up',
  templateUrl: './sign-up.component.html'
})
export class BmSignUpComponent {
  public signUpForm: FormGroup;
  public passwordVisible: boolean;
  public passwordRetypeVisible: boolean;
  public loading: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService,
    private fb: FormBuilder,
  ) {
    this.loading = false;
    this.passwordVisible = false;
    this.passwordRetypeVisible = false;
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      address: [''],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(11)]],
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
        this.toast.error(result.message ?? 'Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
        return;
      }
      this.toast.success('Tạo tài khoản thành công!');
      this.router.navigate(['/login']);
    } catch (error) {
      this.toast.error('Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
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
