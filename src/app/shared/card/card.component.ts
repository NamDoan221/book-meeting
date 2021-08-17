import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'hn-shared-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() labelTitle: string;
  constructor() { }

  ngOnInit() {
  }

}
