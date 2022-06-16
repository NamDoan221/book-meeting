import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bm-lib-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class BmLibCardComponent implements OnInit {
  @Input() labelTitle: string;
  constructor() { }

  ngOnInit() {
  }

}
