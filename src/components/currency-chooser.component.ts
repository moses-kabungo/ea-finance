import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from "@angular/core";
import { Currency } from "src/models/currency.model";

@Component({
  selector: "currency-chooser",
  template: `
    <ul
      class="currencies"
      [class.open]="opened"
      (click)="toggleOpenCurrencies()"
    >
      <ng-container *ngFor="let currency of currencies; let i = index">
        <li (click)="makeSelection(i)">
          {{ currency.name }} - ({{ currency.symbol }})
        </li>
      </ng-container>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyChooserComponent {
  private _opened: boolean = false;
  private _currencies: Currency[];
  private _selectedCurrency: Currency;

  @Input()
  set currencies(vals) {
    this._currencies = vals;
  }

  get currencies() {
    return this._currencies || [];
  }

  @Input()
  set opened(state: boolean) {
    this._opened = state;
    this.openChange.emit(state);
    this.changeDetectorRef.detectChanges();
  }

  get opened(): boolean {
    return this._opened;
  }

  @Output()
  openChange: EventEmitter<boolean> = new EventEmitter();
  @Output()
  selectionChange: EventEmitter<Currency> = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  toggleOpenCurrencies() {
    this.opened = !this._opened;
  }

  makeSelection(index: number) {
    const selection = this._currencies[index];
    this._currencies.splice(index, 1);
    this._currencies = [selection, ...this._currencies];
    this.selectedCurrency = selection;
  }

  @Input()
  set selectedCurrency(currency: Currency) {
    // Ignore unchanged values
    if (
      this._selectedCurrency &&
      this._selectedCurrency.symbol === currency.symbol
    ) {
      return;
    }
    this._selectedCurrency = currency;
    console.log('emitting %s', currency.symbol);
    this.selectionChange.emit(currency);
    this.changeDetectorRef.detectChanges();
  }

  get selectedCurrency() {
    return (
      this._selectedCurrency ||
      (this._currencies && this._currencies.length && this._currencies[0])
    );
  }

  @HostListener("body:click", ["$event.target"])
  closeCurrencies(target: HTMLElement) {
    if (this._opened && target.nodeName.toLowerCase() !== 'li') {
      this.opened = false;
    }
  }
}
