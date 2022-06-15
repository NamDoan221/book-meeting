import { AuthService } from '../lib/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountUser } from '../lib/services/api/account';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'bm-login',
  templateUrl: './login.component.html'
})
export class BmLoginComponent implements OnInit {

  loginForm: FormGroup;
  passwordVisible: boolean;
  loading: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService
  ) {
    this.loading = false;
    this.passwordVisible = false;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  async handlerLogin() {
    if (this.loading) {
      return;
    }
    if (!this.loginForm.valid) {
      for (const i in this.loginForm.controls) {
        this.loginForm.controls[i].markAsDirty();
        this.loginForm.controls[i].updateValueAndValidity();
      }
      return;
    }
    this.loading = true;
    try {
      const user = {
        username: this.loginForm.get('userName') && this.loginForm.get('userName').value || '',
        password: this.loginForm.get('password') && this.loginForm.get('password').value || ''
      }
      // const result = await this.auth.login(user);
      this.toast.success('Đăng nhập thành công!');
      this.router.navigate(['/chat']);
    } catch (error) {
      this.toast.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin đăng nhập.');
      console.log(error);
    } finally {
      // this.loading = false;
    }
  }

  handlerLoginGoogle() {

  }

  handlerSignUp(): any {
    this.router.navigate(['/signup']);
  }

  onChangeViewPassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

}
