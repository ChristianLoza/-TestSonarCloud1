import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { WriteComplexFieldComponent } from '../complex/write-complex-field.component';
import { LinkedCasesService } from './services';

@Component({
  selector: 'ccd-write-case-link-field',
  templateUrl: 'write-case-link-field.html'
})
export class WriteCaseLinkFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  caseReferenceControl: AbstractControl;
  caseLinkGroup: FormGroup;
  containsCaseLinkCollection: boolean;

  @ViewChild('writeComplexFieldComponent')
  writeComplexFieldComponent: WriteComplexFieldComponent;

  constructor(private router: Router,
    private readonly linkedCasesService: LinkedCasesService) {
    super();
  }

  public ngOnInit(): void {
    if (this.caseField.value) {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(this.caseField.value.CaseReference, Validators.required),
      }), true) as FormGroup;
    } else {
      this.caseLinkGroup = this.registerControl(new FormGroup({
        'CaseReference': new FormControl(null, Validators.required),
      }), true) as FormGroup;
    }
    this.caseReferenceControl = this.caseLinkGroup.controls['CaseReference'];
    this.caseReferenceControl.setValidators(this.caseReferenceValidator());

    // Ensure that all sub-fields inherit the same value for retain_hidden_value as this parent; although a CaseLink
    // field uses the Complex type, it is meant to be treated as one field
    if (this.caseField && this.caseField.field_type.type === 'Complex') {
      for (const caseLinkSubField of this.caseField.field_type.complex_fields) {
        caseLinkSubField.retain_hidden_value = this.caseField.retain_hidden_value;
      }
    }
    this.containsCaseLinkCollection = this.hasCaseLinkCollection();
  }

  public submitLinkedCasses(): void {
    this.caseReferenceControl.setValue(this.linkedCasesService.linkedCases.map((caseInfo) => caseInfo.caseReference)[0]);
  }

  private caseReferenceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (control.value) {
        if (this.validCaseReference(control.value)) {
          return null;
        }
        return { 'error': 'Please use a valid 16 Digit Case Reference' };
      } else {
        if (control.touched) {
          return { 'error': 'Please use a valid 16 Digit Case Reference' };
        }
      }
      return null;
    };
  }

  public validCaseReference(valueString: string): boolean {
    if (!valueString) {
      return false;
    }
    return new RegExp('^\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b$').test(valueString.trim());
  }

  public hasCaseLinkCollection(): boolean {
    return this.caseField.field_type && this.caseField.field_type.collection_field_type.id === 'CaseLink';
  }
}
