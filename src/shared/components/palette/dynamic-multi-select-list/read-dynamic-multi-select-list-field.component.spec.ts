import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { ReadDynamicMultiSelectListFieldComponent } from './read-dynamic-multi-select-list-field.component';
import { FixedListPipe } from '../fixed-list/fixed-list.pipe';
import { FormGroup } from '@angular/forms';

const $VALUES = By.css('table>tbody>tr>td');
const FIELD_ID = 'ReadOnlyFieldId';
const FIELD_LIST_ITEMS = [
  {
    label: 'Pierre',
    code: 'P',
    order: 1
  },
  {
    label: 'Paul',
    code: 'PA',
    order: 2
  },
  {
    label: 'Jacques',
    code: 'J',
    order: 3
  }
]
const FIELD_TYPE: FieldType = {
  id: 'MultiSelectList',
  type: 'MultiSelectList',
};
const VALUES = [{
  label: 'Pierre',
  code: 'P',
  order: 1
},
{
  label: 'Paul',
  code: 'PA',
  order: 2
},
{
  label: 'Jacques',
  code: 'J',
  order: 3
}];

let CASE_FIELD: CaseField;

describe('ReadDynamicMultiSelectListFieldComponent', () => {

  describe('Non-persistable readonly multi-select-list field', () => {
    CASE_FIELD = new CaseField();
    CASE_FIELD.id = FIELD_ID;
    CASE_FIELD.label = 'X';
    CASE_FIELD.field_type = FIELD_TYPE;
    CASE_FIELD.value = VALUES;
    CASE_FIELD.list_items = FIELD_LIST_ITEMS;

    const FieldReadComponent = MockComponent({
      selector: 'ccd-field-read',
      inputs: ['caseField']
    });

    let fixture: ComponentFixture<ReadDynamicMultiSelectListFieldComponent>;
    let component: ReadDynamicMultiSelectListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicMultiSelectListFieldComponent,
            FixedListPipe,

            // Mock
            FieldReadComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicMultiSelectListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should NOT render anything when value is undefined', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.children.length).toBe(0);
    });

    it('should NOT render anything when value is null', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.children.length).toBe(0);
    });

    it('should NOT render anything when value is empty array', () => {
      component.caseField.value = [];
      fixture.detectChanges();

      expect(de.children.length).toBe(0);
    });
  });

});
