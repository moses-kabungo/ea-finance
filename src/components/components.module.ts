import { NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CurrencyChooserComponent } from "./currency-chooser.component";

const imports = [CommonModule, FormsModule];
const declarations = [CurrencyChooserComponent];
const providers = [CurrencyPipe];
const exports = [CurrencyChooserComponent, FormsModule];

@NgModule({
  imports,
  declarations,
  providers,
  exports
})
export class ComponentsModule {}
