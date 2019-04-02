import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyChooserComponent } from './currency-chooser.component';
import { CurrencyInputComponent } from './currency-input.component';

const imports = [CommonModule, FormsModule];
const declarations = [CurrencyChooserComponent, CurrencyInputComponent];
const providers = [CurrencyPipe];
const exports = [CurrencyChooserComponent, CurrencyInputComponent, FormsModule];

@NgModule({
  imports,
  declarations,
  providers,
  exports
})
export class ComponentsModule {}
