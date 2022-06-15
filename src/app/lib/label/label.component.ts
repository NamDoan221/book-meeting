import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-shared-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})
export class LabelComponent implements OnInit {

  @Input() label: any;
  @Input() description: any;
  constructor() { }

  ngOnInit() {
  }

}
