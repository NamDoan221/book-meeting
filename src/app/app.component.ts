import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  lang = 'vi';

  constructor(
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang(this.lang);
  }

  ngOnInit(): void {
  }
}
