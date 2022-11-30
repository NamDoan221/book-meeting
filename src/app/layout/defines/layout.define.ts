import { IFunction } from "src/app/lib/services/function/interfaces/function.interface";

export const menuDefault = (): IFunction[] => {
  return [{
    Name: 'Trang chủ',
    Icon: 'home',
    Url: '/dashboard',
    IsMenu: false
  },
  {
    Name: 'Quản lý',
    Icon: 'user',
    IsMenu: false,
    FunctionChilds: [
      {
        Name: 'Nhân viên',
        Url: '/personnel',
        IsMenu: false,
      },
      {
        Name: 'Phòng ban',
        Url: '/department',
        IsMenu: false,
      },
      {
        Name: 'Chức vụ',
        Url: '/position',
        IsMenu: false,
      },
      {
        Name: 'Phòng họp',
        Url: '/meeting-room',
        IsMenu: false,
      },
      {
        Name: 'Lịch họp',
        Url: '/meeting-schedule',
        IsMenu: false,
      },
      {
        Name: 'Điểm danh',
        Url: '/attendance',
        IsMenu: false,
      }
    ]
  },
  {
    Name: 'Cài đặt',
    Icon: 'setting',
    IsMenu: false,
    FunctionChilds: [
      {
        Name: 'Thông tin tài khoản',
        Url: '/account',
        IsMenu: false,
      },
      {
        Name: 'Cấu hình dữ liệu khuôn mặt',
        Url: '/config-face',
        IsMenu: false,
      },
      {
        Name: 'Cấu hình google calendar',
        Url: '/config-google-calendar',
        IsMenu: false,
      },
      {
        Name: 'Lịch sử điểm danh',
        Url: '/attendance-history',
        IsMenu: false,
      },
      {
        Name: 'Phân quyền',
        Url: '/role',
        IsMenu: false,
      },
      {
        Name: 'Chức năng',
        Url: '/function',
        IsMenu: false,
      },
      {
        Name: 'Danh mục',
        Url: '/dictionary',
        IsMenu: false,
      },
      {
        Name: 'Đăng xuất',
        Url: '/logout',
        IsMenu: false,
      }
    ]
  }];
};