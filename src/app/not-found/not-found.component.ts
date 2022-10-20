import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'bm-not-found',
  template: `
  <div class="w-100 h-100 d-flex align-items-center justify-content-center">
    <nz-result nzStatus="404" nzTitle="404" nzSubTitle="Xin lỗi, trang bạn đã truy cập không tồn tại.">
      <div nz-result-extra>
        <button nz-button nzType="primary" (click)="handlerBackHome($event)">Trang chủ</button>
      </div>
    </nz-result>
  </div>
  `
})
export class BmNotFoundComponent {

  constructor(private router: Router) { }

  handlerBackHome(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/account']);
  }
}
