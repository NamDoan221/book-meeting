import { AuthService } from '../lib/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBodyLogin } from '../lib/services/auth/interfaces/auth.interfaces';

@Component({
  selector: 'bm-login',
  templateUrl: './login.component.html'
})
export class BmLoginComponent implements OnInit {

  loginForm: FormGroup;
  passwordVisible: boolean;
  loading: boolean;
  loadingGoogle: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService
  ) {
    this.loading = false;
    this.loadingGoogle = false;
    this.passwordVisible = false;
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    const url = window.location.href.replace(/(http:|https:)[/]+[^/]+/g, '').replace('/login', '');
    if (this.auth.verifyToken()) {
      this.router.navigateByUrl(url);
    }
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
      const body: IBodyLogin = {
        username: this.loginForm.get('username') && this.loginForm.get('username').value || '',
        password: this.loginForm.get('password') && this.loginForm.get('password').value || ''
      }
      await this.auth.login(body);
      this.toast.success('Đăng nhập thành công!');
      this.router.navigate(['/meeting-schedule']);
    } catch (error) {
      this.toast.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin đăng nhập.');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  async handlerLoginGoogle() {
    if (this.loadingGoogle) {
      return;
    }
    this.loadingGoogle = true;
    try {
      const result = await this.auth.loginGoogle();
      console.log(result);

      // this.toast.success('Đăng nhập thành công!');
      // this.router.navigate(['/chat']);
    } catch (error) {
      // this.toast.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin đăng nhập.');
      console.log(error);
    } finally {
      this.loadingGoogle = false;
    }
  }

  handlerSignUp(): any {
    this.router.navigate(['/signup']);
  }

  onChangeViewPassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

}
