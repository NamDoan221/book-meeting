import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'number-pipe'
})
export class NumberPipePipe implements PipeTransform {

  transform(value: any, type: string, parseFixed: number, notPipeFormatNumber: boolean, emptyValue0: boolean): any {

    if (value === 0 && emptyValue0) {
      return 0;
    }

    if (!value) {
      return;
    }

    if (notPipeFormatNumber) {
      return value;
    }

    switch (type) {
      case 'integer':
        if (typeof value !== 'string') {
          value = String(value);
        }
        const resultInt = this.formatNumber(value);
        return value ? this.formatNumberValue(parseInt(resultInt, 10), false) : '';
    }
  }


  formatNumberValue(value: number, acceptNegativeValue: boolean, parseFixed: number = 1): any {
    // const lang = CURRENT_LANG();
    if (value === undefined || typeof value !== 'number' || (!acceptNegativeValue && value <= 0)) {
      return 0;
    }
    value = parseFloat(value.toFixed(parseFixed));
    // Xử lý không format dữ liệu phần thập phân
    const valueString = value.toString();
    const index = valueString.indexOf('.');
    if (index !== -1 && parseFixed > 3) {
      const decimalPart = valueString.substring(index + 1, valueString.length);
      let int = valueString.substring(0, index + 1);
      // if (lang === LANGUAGE.EN) {
      //   int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      //   return `${int}${decimalPart}`;
      // }
      int = int.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${int}${decimalPart}`;
    }
    if (index === -1 || parseFixed <= 3) {
      // if (lang === LANGUAGE.EN) {
      //   return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      // }
      return value.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  }

  formatNumber(value: string) {
    // const lang = this.lang ? this.lang : CURRENT_LANG();
    // if (lang === LANGUAGE.EN) {
    //   return value.replace(/[,]/g, '');
    // }
    return value.replace(/[.]/g, '').replace(/[,]/g, '.');
  }

}
