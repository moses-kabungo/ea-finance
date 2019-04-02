import { Component, ViewChild } from '@angular/core';
import { Currency } from 'src/models/currency.model';
import { CurrencyInputComponent } from 'src/components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EA Finance';
  currencies: Currency[] = [
    {
      name: 'US Dollar',
      symbol: 'USD'
    },
    {
      name: 'Euro',
      symbol: 'EUR'
    },
    {
      name: 'Burundi Franc',
      symbol: 'BIF'
    },
    {
      name: 'Kenyan Shilling',
      symbol: 'KSH'
    },
    {
      name: 'Rwanda Franc',
      symbol: 'RWF'
    },
    {
      name: 'Tanzania Shilling',
      symbol: 'TSH'
    },
    {
      name: 'Uganda Shilling',
      symbol: 'USH'
    }
  ];

  @ViewChild(CurrencyInputComponent)
  currencyInput: CurrencyInputComponent;

  currentSelection: Currency = this.currencies[0];

  _amount: string;

  onSelectionChange(currency: Currency) {
    this.currentSelection = currency;
    this.currencyInput.symbol = currency.symbol;
    this.currencyInput.asYouTypeUp();
  }

  set amount(amt: string) {
    this._amount = amt;
  }

  get amount(): string {
    return this._amount || '1';
  }

  constructor() {}
}
