import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import vi from '@angular/common/locales/vi';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as quarterOfYear from 'dayjs/plugin/quarterOfYear';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import * as utc from 'dayjs/plugin/utc';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzI18nService, NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzResultModule } from 'ng-zorro-antd/result';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { IconsProviderModule } from './lib/icon-ant/icons-provider.module';
import { UserCanActive } from './lib/services/auth/auth.service';
import { AuthInterceptorProviders } from './lib/services/interceptor/auth.interceptor';
import { BmNotFoundComponent } from './not-found/not-found.component';

dayjs.extend(relativeTime)
dayjs.extend(isoWeek)
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(quarterOfYear)
registerLocaleData(vi);

export function HttpLoaderFactory(http: HttpClient): any {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    BmNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false,
    }),
    NzResultModule,
    NzButtonModule,
    NzMessageModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: vi_VN },
    UserCanActive,
    AuthInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private translate: TranslateService, private i18n: NzI18nService) {
    this.translate.setDefaultLang('vi');
    this.i18n.setLocale(vi_VN);
  }
}
