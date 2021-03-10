import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { attr } from '../../../test/helpers';
import { WriteDynamicMultiSelectListFieldComponent } from './write-dynamic-multi-select-list-field.component';

const VALUES = ['Option1', 'Option2'];
const FIELD_ID = 'DynamicMultiSelectList';
const FIELD_LIST_ITEMS = [
  {
    code: 'Option1',
    label: 'Option 1',
    order: 1
  },
  {
    code: 'Option2',
    label: 'Option 2',
    order: 2
  }
];

const FIELD_TYPE: FieldType = {
  id: 'DynamicMultiSelectList',
  type: 'DynamicMultiSelectList',
};

const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUES,
  list_items: FIELD_LIST_ITEMS
});

describe('WriteDynamicMultiSelectListFieldComponent', () => {

  const $CHECKBOXES = By.css('input[type="checkbox"]');
  const $SELECTED_CHECKBOXES = By.css('input[type="checkbox"]:checked');
  const $OPTION_1 = By.css('input[value="Option1"]');

  let fixture: ComponentFixture<WriteDynamicMultiSelectListFieldComponent>;
  let component: WriteDynamicMultiSelectListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteDynamicMultiSelectListFieldComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDynamicMultiSelectListFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should register a FormArray', () => {
    expect(component.checkboxes.constructor).toBe(FormArray);
  });

  it('should initialise FormArray with initial values', () => {
    expect(component.checkboxes.controls.length).toEqual(2);
    expect(component.checkboxes.controls[0].value).toEqual(VALUES[0]);
    expect(component.checkboxes.controls[1].value).toEqual(VALUES[1]);
  });

  it('should render a checkbox for each available option', () => {
    const checkboxes = de.queryAll($CHECKBOXES);

    expect(checkboxes.length).toEqual(FIELD_LIST_ITEMS.length);

    FIELD_LIST_ITEMS.forEach(item => {
      expect(checkboxes.find(checkbox => attr(checkbox, 'value') === item.code)).toBeTruthy();
    });
  });

  it('should mark as selected the initially selected checkboxes', () => {
    let checkboxes = de.queryAll($SELECTED_CHECKBOXES);

    expect(checkboxes.length).toEqual(VALUES.length);

    VALUES.forEach(value => {
      expect(checkboxes.find(checkbox => attr(checkbox, 'value') === value)).toBeTruthy();
    });
  });

  it('should remove option from values when unselected', () => {
    let option1 = de.query($OPTION_1).nativeElement;
    option1.click();

    fixture.detectChanges();

    expect(option1.checked).toBeFalsy();
    expect(component.checkboxes.controls.length).toEqual(1);
    expect(component.checkboxes.controls[0].value).not.toEqual(FIELD_LIST_ITEMS[0].code);
  });
});
