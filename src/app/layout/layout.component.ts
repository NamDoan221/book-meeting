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
  menuData: any[];
  currentPath: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService) {
    this.isCollapsed = false;
    this.menuData = [
      {
        label: 'Quản lý',
        icon: 'user',
        items: [
          {
            label: 'Nhân sự',
            url: '/personnel'
          },
          {
            label: 'Phòng, Ban',
            url: '/department'
          },
          {
            label: 'Phòng họp',
            url: '/meeting-room'
          },
          {
            label: 'Lịch họp',
            url: '/meeting-schedule'
          },
          {
            label: 'Điểm danh',
            url: '/attendance'
          }
        ]
      },
      {
        label: 'Cài đặt',
        icon: 'setting',
        items: [
          {
            label: 'Tài khoản',
            url: '/account'
          },
          {
            label: 'Đăng xuất',
            url: 'logout'
          }
        ]
      }
    ]
  }

  ngOnInit(): void {
    this.currentPath = this.router.url;
  }

  async handlerRouting(event: Event, url: string) {
    event.stopPropagation();
    if (url === 'logout') {
      try {
        const result = await this.auth.logout();
        localStorage.setItem('access-token', JSON.stringify(result));
        this.router.navigate(['/login']);
      } catch (error) {
        console.log(error);
      }
      return;
    }
    this.currentPath = url;
    this.router.navigate([url]);
  }

}
