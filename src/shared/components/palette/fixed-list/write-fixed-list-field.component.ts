import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-fixed-list-field',
  templateUrl: './write-fixed-list-field.html'
})
export class WriteFixedListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  fixedListFormControl: FormControl;

  ngOnInit() {

    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty for DynamicList's
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

    let isNull = this.caseField.value === undefined || this.caseField.value === '';
    if (isNull) {
      this.caseField.value = null;
    }
    this.fixedListFormControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }
}
