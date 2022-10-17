import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { attr } from '../../../test/helpers';
import { WriteDynamicMultiSelectListFieldComponent } from './write-dynamic-multi-select-list-field.component';

const VALUES = [{
  code: 'Option1',
  label: 'Option 1',
  order: 1
},
{
  code: 'Option2',
  label: 'Option 2',
  order: 2
}];
const FIELD_ID = 'DynamicMultiSelectList';
const LIST_ITEMS = [
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

let CASE_FIELD: CaseField;

const $CHECKBOXES = By.css('input[type="checkbox"]');
const $SELECTED_CHECKBOXES = By.css('input[type="checkbox"]:checked');
const $UNSELECTED_CHECKBOXES = By.css('input[type="checkbox"]:not(:checked)');
const $OPTION_1 = By.css('input[value="Option1"]');

describe('WriteDynamicMultiSelectListFieldComponent', () => {
  let fixture: ComponentFixture<WriteDynamicMultiSelectListFieldComponent>;
  let component: WriteDynamicMultiSelectListFieldComponent;
  let de: DebugElement;

  describe('List Value Dynamic Case Field', () => {
    beforeEach(async(() => {

      CASE_FIELD = <CaseField>({
        id: FIELD_ID,
        label: 'X',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: VALUES,
        list_items: LIST_ITEMS
      });

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

      expect(checkboxes.length).toEqual(LIST_ITEMS.length);

      LIST_ITEMS.forEach(item => {
        expect(checkboxes.find(checkbox => attr(checkbox, 'value') === item.code)).toBeTruthy();
      });
    });

    it('should mark as selected the initially selected checkboxes', () => {
      const checkboxes = de.queryAll($SELECTED_CHECKBOXES);

      expect(checkboxes.length).toEqual(VALUES.length);

      VALUES.forEach(value => {
        expect(checkboxes.find(checkbox => attr(checkbox, 'value') === value.code)).toBeTruthy();
      });
    });
  });

  describe('Null Value Dynamic Case Field', () => {
    beforeEach(async(() => {

      CASE_FIELD = <CaseField>({
        id: FIELD_ID,
        label: 'X',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: null,
        list_items: LIST_ITEMS
      });

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

    it('should set all checkboxes unselected when caseField is null', () => {
      const checkboxes = de.queryAll($UNSELECTED_CHECKBOXES);

      expect(checkboxes.length).toEqual(2);
    });

    it('should add value to checkbox when selected', () => {
      const option1 = de.query($OPTION_1).nativeElement;
      option1.click();

      expect(component.checkboxes.length).toEqual(1);
    });
  });

  describe('Object Value Dynamic Case Field', () => {
    beforeEach(async(() => {

      CASE_FIELD = <CaseField>({
        id: FIELD_ID,
        label: 'X',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: LIST_ITEMS[0],
        list_items: LIST_ITEMS
      });

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

    it('should set all checkboxes unselected when caseField is an object', () => {
      const checkboxes = de.queryAll($UNSELECTED_CHECKBOXES);

      expect(checkboxes.length).toEqual(2);
    });

    it('should add value to checkbox when selected', () => {
      const option1 = de.query($OPTION_1).nativeElement;
      option1.click();

      expect(component.checkboxes.length).toEqual(1);
    });
  });
});