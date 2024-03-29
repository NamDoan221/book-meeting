import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import {
  MailOutline,
  PictureOutline,
  EyeOutline,
  EyeInvisibleOutline,
  UsergroupAddOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  MessageOutline,
  WechatOutline,
  SettingOutline,
  SendOutline,
  PlusOutline,
  MoreOutline,
  UserOutline,
  SearchOutline,
  VideoCameraOutline,
  PhoneOutline,
  UnlockOutline,
  PoweroffOutline,
  RetweetOutline,
  SlackSquareOutline,
  GoogleOutline,
  FireOutline,
  LockOutline,
  LoginOutline,
  ShopOutline,
  MehOutline,
  IdcardOutline,
  NotificationOutline,
  BellOutline,
  HomeOutline,
  UndoOutline,
  UserAddOutline,
  UserSwitchOutline,
  EnvironmentOutline,
  BankOutline,
  SmileOutline,
  ScanOutline,
  PauseCircleOutline,
  InfoCircleOutline,
  RedoOutline
} from '@ant-design/icons-angular/icons';

const icons = [
  MailOutline,
  PictureOutline,
  EyeOutline,
  EyeInvisibleOutline,
  RetweetOutline,
  PoweroffOutline,
  UnlockOutline,
  UsergroupAddOutline,
  PhoneOutline,
  VideoCameraOutline,
  SearchOutline,
  UserOutline,
  MoreOutline,
  PlusOutline,
  SendOutline,
  SettingOutline,
  WechatOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  MessageOutline,
  SlackSquareOutline,
  GoogleOutline,
  FireOutline,
  LockOutline,
  LoginOutline,
  ShopOutline,
  MehOutline,
  IdcardOutline,
  NotificationOutline,
  BellOutline,
  HomeOutline,
  UndoOutline,
  UserAddOutline,
  UserSwitchOutline,
  EnvironmentOutline,
  BankOutline,
  SmileOutline,
  ScanOutline,
  PauseCircleOutline,
  InfoCircleOutline,
  RedoOutline
];
@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [{ provide: NZ_ICONS, useValue: icons }],
})
export class IconsProviderModule { }
