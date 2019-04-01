import { Component, ViewChild, ElementRef } from "@angular/core";
import { Currency } from "src/models/currency.model";
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "EA Finance";
  currencies: Currency[] = [
    {
      name: "US Dollar",
      symbol: "USD"
    },
    {
      name: "Euro",
      symbol: "EUR"
    },
    {
      name: "Burundi Franc",
      symbol: "BIF"
    },
    {
      name: "Kenyan Shilling",
      symbol: "KSH"
    },
    {
      name: "Rwanda Franc",
      symbol: "RWF"
    },
    {
      name: "Tanzania Shilling",
      symbol: "TSH"
    },
    {
      name: "Uganda Shilling",
      symbol: "USH"
    }
  ];

  currentSelection: Currency = this.currencies[0];

  _amount: string;

  onSelectionChange(currency: Currency) {
    this.currentSelection = currency;
    console.log(this.currentSelection);
  }

  formatAmount(value) {
    return this.currencyPipe.transform(
      value,
      this.currentSelection.symbol,
      "symbol",
      this.currentSelection.digitsInfo
    );
  }

  parseAmount(value) {
    return Number(value.replace(/[^0-9.-]+/g, "")).toString();
  }

  asYouType(value) {
    console.log(value);
    if (/BACKSPACE/i.test(value) && this.amount.length) {
      this.amount = this.parseAmount(
        this.amount.substr(0, this.amount.length - 1)
      );
      return true;
    }
    // const parsed = this.parseAmount(this.amount + value);
    // this.amount = this.formatAmount(parsed);
  }

  set amount(amt: string) {
    this._amount = amt;
  }

  get amount(): string {
    return this._amount || "1";
  }

  constructor(private currencyPipe: CurrencyPipe) {}
}
