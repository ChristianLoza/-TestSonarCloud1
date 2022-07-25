import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-read-complex-field',
  templateUrl: './read-complex-field.html',
})
export class ReadComplexFieldComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  caseFields: CaseField[] = [];

  public paletteContext = PaletteContext;

  ngOnInit(): void {
    super.ngOnInit();
    if (this.caseField.display_context_parameter) {
      this.context = PaletteContext.TABLE_VIEW;
    } else {
      // default to default views
      if (!this.caseField.display_context_parameter && this.context) {
        this.context = PaletteContext.DEFAULT;
      }
    }
    if (this.caseField.field_type) {
      this.caseField.field_type.complex_fields.map(field => {
        if (field.isDynamic() && this.caseField.value[field.id]) {
          field.list_items = this.caseField.value[field.id].list_items;
          field.value = {
            list_items: field.list_items,
            value: this.caseField.value[field.id].value && this.caseField.value[field.id].value.code ?
                    this.caseField.value[field.id].value.code :
                    this.caseField.value[field.id].value
          };
        }
      });
    }
  }

}
