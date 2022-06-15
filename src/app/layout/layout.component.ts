import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../lib/services/auth.service';

@Component({
  selector: 'bm-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class BmLayoutComponent implements OnInit {
  public isCollapsed: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService) {
    this.isCollapsed = false;
  }

  ngOnInit(): void {
  }

  async handlerLogout(): Promise<any> {
    try {
      const result = await this.auth.logout();
      localStorage.setItem('access-token', JSON.stringify(result));
      this.router.navigate(['/login']);
    } catch (error) {
      this.toast.error('Thao tác thất bại!');
      console.log(error);
    }
  }

}
