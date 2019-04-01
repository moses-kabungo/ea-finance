import {
  Component,
  Input,
  forwardRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'currency-input',
  template: `
    <input
      #currencyInput
      type="text"
      [min]="min"
      [max]="max"
      [class]="classList"
      [name]="name"
      [spellcheck]="spellcheck"
      [autocomplete]="autocomplete"
      [autofocus]="autofocus"
      [value]="value"
      (focusin)="currencyInput.setSelectionRange(symbol.length + 1, currencyInput.value.length)"
      (keydown)="asYouTypeDown($event.key)"
      (keyup)="asYouTypeUp()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true
    }
  ]
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @Input()
  autocomplete = false;
  @Input()
  spellcheck = false;
  @Input()
  autofocus = false;
  @Input()
  id: string;
  @Input()
  name: string;
  @Input()
  min = 0.0;
  @Input()
  max = Number.MAX_VALUE;
  @Input()
  classList: string[];
  @Input()
  symbol = 'USD';

  @ViewChild('currencyInput')
  _el: ElementRef<any>;

  private val: string;

  constructor() {}

  @Input()
  set value(val: string) {
    this.val = val;
    this.onChange(val);
    this.onTouched();
  }

  get value() {
    return this.val;
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }

  writeValue(value: string) {
    if (value && value.length) {
      this.value = value;
    }
  }

  get el() {
    return this._el.nativeElement as HTMLInputElement;
  }

  asYouTypeDown(inputValue: string) {
    // apply rules
    const val = this.el.value;
    if (val.indexOf('.') !== -1) {
      const rhs = val.substring(val.indexOf('.'));
      if (rhs.length > 2) {
        if (!inputValue.match(/BACKSPACE/i)) {
          return false;
        }
      }
    }
    // don't validate empty input
    if (!val.trim().length || isNaN(parseInt(inputValue, 10))) {
      // handle backspace
      if (inputValue.match(/BACKSPACE/i) || inputValue.match(/DELETE/i)) {
        // do not erase symbols
        if (val.length === this.symbol.length + 1) {
          return false;
        }
      }
    }
    return true;
  }

  asYouTypeUp() {
    let val = this.el.value;
    // remember state before modification
    const len0 = val.length;
    const pos0 = this.el.selectionStart;

    // find decimal
    if (val.indexOf('.') !== -1) {
      const decimalPos = val.indexOf('.');
      const lhs = val
        .substring(0, decimalPos)
        .replace(/\D/g, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const rhs = val
        .substring(decimalPos)
        .replace(/\D/g, '')
        .substring(0, 2);
      // cannot add more than two digits
      if (rhs.length > 1) {
        return false;
      }
      val = this.symbol + ' ' + lhs + '.' + rhs;
    } else {
      val =
        this.symbol +
        ' ' +
        val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    // find decimal point
    this.value = val;
    // find decimal point and put current before it
    const len1 = val.length;
    const pos1 = len1 - len0 + pos0;
    this.el.setSelectionRange(pos1, pos1);
  }
}
