import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-shared-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  public value: string;

  @Input() label: any;
  @Input() placeholder: string;
  @Input() classInclude: string;
  @Input() type: string;
  @Input() valueType: string;
  @Input() item: any;
  @Input() field: string;


  @Output() onTextChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onBlur: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('input') input: ElementRef;

  constructor() {
    this.type = 'text';
    this.placeholder = '';
  }

  ngOnInit() {
  }

  handlerKeyUp(event: KeyboardEvent, value) {
    event.stopPropagation();
    this.item[this.field] = this.formatNumber(value);
  }

  handlerKeyDown(event: KeyboardEvent, value) {
    event.stopPropagation();
    const type = this.valueType;
    const key = event.which;
    if (key === 190 || key === 188 || key === 110) {
      event.preventDefault();
    }
    if (type !== 'integer' && type !== 'float') {
      return;
    }
    if (!(!event.shiftKey && !event.altKey && !event.ctrlKey &&
      // numbers
      key >= 48 && key <= 57 ||
      // Numeric keypad
      key >= 96 && key <= 105 ||
      // Backspace and Tab and Enter
      key === 8 || key === 9 || key === 13 ||
      // Home and End
      key === 35 || key === 36 ||
      // left and right arrows
      key === 37 || key === 39 ||
      // Del and Ins
      key === 46 || key === 45 ||
      // Period, Comma, NumpadDecimal
      key === 190 || key === 188 || key === 110)) {
        event.preventDefault();
      }
  }

  handlerChange(value: string, type: string) {
    if (type !== 'number') {
      return;
    }
    this.item[this.field] = value;
    console.log(value);
  }

  public handlerOnBlur(e: Event) {
    e.stopPropagation();
    this.onBlur.emit();
    const onFocusInput = new Subject();
    onFocusInput.next(false);
  }

  public handlerOnFocus(e: Event) {
    e.stopPropagation();
    const onFocusInput = new Subject();
    onFocusInput.next(true);
  }

  formatNumber(value: string) {
    // const lang = this.lang ? this.lang : CURRENT_LANG();
    // if (lang === LANGUAGE.EN) {
    //   return value.replace(/[,]/g, '');
    // }
    return value.replace(/[.]/g, '').replace(/[,]/g, '.');
  }

  onClick() {
    this.input.nativeElement.focus();
  }

}
