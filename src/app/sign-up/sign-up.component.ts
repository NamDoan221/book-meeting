import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountRegister } from '../lib/services/api/account';
import { AuthService } from '../lib/services/auth.service';

@Component({
  selector: 'bm-sign_up',
  templateUrl: './sign-up.component.html'
})
export class BmSignUpComponent implements OnInit {
  signUpForm: FormGroup;
  passwordVisible: boolean;
  confirmPasswordVisible: boolean;
  loading: boolean;
  public user: AccountRegister;
  public onRegister: boolean;
  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService,
    private fb: FormBuilder,
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
    this.signUpForm = this.fb.group({
      userName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      confirm_password: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  ngOnInit(): void {
  }


  handlerLogin(): any {
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
      const user = {
        username: this.signUpForm.get('userName') && this.signUpForm.get('userName').value || '',
        password: this.signUpForm.get('password') && this.signUpForm.get('password').value || ''
      }
      await this.auth.register(user);
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
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

}
