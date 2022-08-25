import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { FormModule } from '../../../../components/form/form.module';
import { CaseField, FieldType } from '../../../domain';
import { CaseFieldService } from '../../../services';
import { PaletteUtilsModule } from '../utils';
import { WriteDateFieldComponent } from './write-date-field.component';

const FIELD_ID = 'CreatedAt';
const FIELD_TYPE: FieldType = {
  id: 'Date',
  type: 'Date'
};
const VALUE = '2017-07-26';
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteDateFieldComponent', () => {

  let fixture: ComponentFixture<WriteDateFieldComponent>;
  let component: WriteDateFieldComponent;
  let de: DebugElement;
  const caseFieldService = new CaseFieldService();

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule,
          FormModule,
          RpxTranslationModule.forRoot({
            baseUrl: '',
            debounceTimeMs: 300,
            testMode: true,
            validity: {
              days: 1
            }
          })
        ],
        declarations: [
          WriteDateFieldComponent,
        ],
        providers: [
          {provide: CaseFieldService, useValue: caseFieldService},
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDateFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
  });
});
