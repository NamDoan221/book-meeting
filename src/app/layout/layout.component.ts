import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../lib/services/auth/auth.service';
import { CacheService } from '../lib/services/cache.service';

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
    private cacheService: CacheService
  ) {
    this.isCollapsed = false;
    this.menuData = [
      {
        label: 'Trang chủ',
        icon: 'home',
        url: '/dashboard',
        active: false
      },
      {
        label: 'Quản lý',
        icon: 'user',
        items: [
          {
            label: 'Nhân viên',
            url: '/personnel',
            active: false,
          },
          {
            label: 'Phòng, Ban',
            url: '/department',
            active: false,
          },
          {
            label: 'Chức vụ',
            url: '/position',
            active: false,
          },
          {
            label: 'Phòng họp',
            url: '/meeting-room',
            active: false,
          },
          {
            label: 'Lịch họp',
            url: '/meeting-schedule',
            active: true,
          },
          {
            label: 'Điểm danh',
            url: '/attendance',
            active: false,
          },
          {
            label: 'Dữ liệu khuôn mặt',
            url: '/face-data',
            active: false,
          }
        ]
      },
      {
        label: 'Cài đặt',
        icon: 'setting',
        items: [
          {
            label: 'Thông tin tài khoản',
            url: '/account',
            active: false,
          },
          {
            label: 'Cấu hình dữ liệu khuôn mặt',
            url: '/config-face',
            active: false,
          },
          {
            label: 'Cấu hình google calendar',
            url: '/config-google-calendar',
            active: false,
          },
          {
            label: 'Lịch sử điểm danh',
            url: '/attendance-history',
            active: false,
          },
          {
            label: 'Phân quyền',
            url: '/role',
            active: false,
          },
          {
            label: 'Chức năng',
            url: '/function',
            active: false,
          },
          {
            label: 'Đăng xuất',
            url: 'logout',
            active: false,
          }
        ]
      }
    ]
  }

  async ngOnInit(): Promise<void> {
    this.currentPath = this.router.url;
    const role = 'manager';
    if (role === 'manager' || role === 'admin') {
      this.menuData = this.menuData.map(element => {
        return {
          ...element,
          items: element.items?.map(item => {
            return {
              ...item,
              active: true
            }
          })
        }
      })
    }
  }

  async handlerRouting(event: Event, url: string) {
    event.stopPropagation();
    if (!url) {
      return;
    }
    if (url === 'logout') {
      try {
        const result = await this.auth.logout();
        this.cacheService.clearAll();
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
