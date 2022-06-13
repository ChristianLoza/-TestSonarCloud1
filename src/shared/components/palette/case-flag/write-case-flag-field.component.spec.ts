import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField } from '../../../domain/definition';
import { AddCommentsComponent } from './components';
import { CaseFlagFieldState, CaseFlagStatus } from './enums';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

describe('WriteCaseFlagFieldComponent', () => {
  let component: WriteCaseFlagFieldComponent;
  let fixture: ComponentFixture<WriteCaseFlagFieldComponent>;
  let addCommentsComponent: AddCommentsComponent;
  const flaglauncher_id = 'FlagLauncher';
  const flagLauncherCaseField: CaseField = {
    id: 'FlagLauncher1',
    field_type: {
      id: flaglauncher_id,
      type: flaglauncher_id
    }
  } as CaseField;
  const caseFlag1FieldId = 'CaseFlag1';
  const caseFlag1PartyName = 'John Smith';
  const caseFlag1RoleOnCase = 'Claimant';
  const caseFlag1DetailsValue1 = {
    name: 'Wheelchair access',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Reasonable adjustment',
      'Mobility support'
    ],
    hearingRelevant: 'No',
    flagCode: 'WCA',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlag1DetailsValue2 = {
    name: 'Sign language',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Reasonable adjustment',
      'Language support'
    ],
    hearingRelevant: 'No',
    flagCode: 'BSL',
    status: CaseFlagStatus.INACTIVE
  };
  const caseFlag2FieldId = 'CaseFlag2';
  const caseFlag2PartyName = 'Ann Peterson';
  const caseFlag2RoleOnCase = 'Defendant';
  const caseFlag2DetailsValue1 = {
    name: 'Foreign national offender',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Security adjustment'
    ],
    hearingRelevant: 'Yes',
    flagCode: 'FNO',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlag2DetailsValue2 = {
    name: 'Sign language',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Reasonable adjustment',
      'Language support'
    ],
    hearingRelevant: 'Yes',
    flagCode: 'WCA',
    status: CaseFlagStatus.INACTIVE
  };
  const mockRoute = {
    snapshot: {
      data: {
        case: {
          case_id: '1111222233334444',
          case_type: {
            id: 'TEST',
            name: 'Test',
            jurisdiction: {
              id: 'SSCS',
              name: 'Social Security and Child Support'
            }
          }
        },
        eventTrigger: {
          case_fields: [
            flagLauncherCaseField,
            {
              id: caseFlag1FieldId,
              field_type: {
                // TODO: Temporary field type; needs to be changed to "Flags" once the implementation has been changed over
                id: 'CaseFlag',
                type: 'Complex'
              },
              value: {
                partyName: caseFlag1PartyName,
                roleOnCase: caseFlag1RoleOnCase,
                details: [
                  {
                    id: '6e8784ca-d679-4f36-a986-edc6ad255dfa',
                    value: caseFlag1DetailsValue1
                  },
                  {
                    id: '9a179b7c-50a8-479f-a99b-b191ec8ec192',
                    value: caseFlag1DetailsValue2
                  }
                ]
              }
            },
            {
              id: caseFlag2FieldId,
              field_type: {
                // TODO: Temporary field type; needs to be changed to "Flags" once the implementation has been changed over
                id: 'CaseFlag',
                type: 'Complex'
              },
              value: {
                partyName: caseFlag2PartyName,
                roleOnCase: caseFlag2RoleOnCase,
                details: [
                  {
                    id: '61160453-647b-4065-a786-9443556055f1',
                    value: caseFlag2DetailsValue1
                  },
                  {
                    id: '0629f5cd-52bc-41ac-a2e0-5da9bbee2068',
                    value: caseFlag2DetailsValue2
                  }
                ]
              }
            }
          ]
        }
      }
    }
  };

  addCommentsComponent = new AddCommentsComponent();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ WriteCaseFlagFieldComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: AddCommentsComponent, useValue: addCommentsComponent }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteCaseFlagFieldComponent);
    component = fixture.componentInstance;
    component.addCommentsComponent = addCommentsComponent;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have called ngOnInit, created a FormGroup with a validator, and set the correct Case Flag field starting state', () => {
    expect(component.ngOnInit).toBeTruthy();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.validator).toBeTruthy();
    if (!component.isDisplayContextParameterUpdate) {
      expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_LOCATION);
    }
    // Initial validity of the form is expected to be false because it is at the starting state (only valid at the final state)
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
  });

  // TODO: Need to re-visit later as the next button has been moved to the child components
  xit('should move the Case Flag field to the next state, and update the validity if it is at the final state (FLAG_SUMMARY)', () => {
    spyOn(component.formGroup, 'updateValueAndValidity').and.callThrough();
    const nextButton = fixture.debugElement.nativeElement.querySelector('button[type=button]');
    nextButton.click();
    fixture.detectChanges();
    // Field is expected to move to next state (flag type) but not the final one yet
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_TYPE);
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
    nextButton.click();
    fixture.detectChanges();
    // Field is expected to move to final state (flag comments) and the form to become valid
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_COMMENTS);
    expect(component.isAtFinalState()).toBe(true);
    // Form validation should not be called until reaching the final state, hence expecting only one call
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalledTimes(1);
    expect(component.formGroup.errors).toBeNull();
    expect(component.formGroup.valid).toBe(true);
  });

  it('should extract all flags-related data from the CaseEventTrigger object in the snapshot data', () => {
    component.caseField = flagLauncherCaseField;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(2);
    expect(component.flagsData[0].flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].details.length).toBe(2);
    expect(component.flagsData[0].details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[0].details[0].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[0].details[0].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[0].details[0].hearingRelevant).toBe(false);
    expect(component.flagsData[1].flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.flagsData[1].partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].details.length).toBe(2);
    expect(component.flagsData[1].details[1].name).toEqual(caseFlag2DetailsValue2.name);
    expect(component.flagsData[1].details[1].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[1].details[1].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[1].details[1].hearingRelevant).toBe(true);
  });

  // TODO: The below test will be looked at during the future sprint work for case flags
  // Setting it to non-runnable for now
  xit('should succeed validate and set flags case field value', () => {
    spyOn(component.addCommentsComponent, 'validateFlagComments');
    spyOn(component, 'populateNewFlagDetailInstance').and.returnValue({});
    component.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
    component.caseFlagParentFormGroup = new FormGroup({'caseField': new FormControl('')});
    component.caseFlagParentFormGroup.get('caseField').setValue('sdffsf');
    component.validateAndSetFlagsCaseFieldValue();
    expect(component.addCommentsComponent.validateFlagComments).toHaveBeenCalled();
    expect(component.populateNewFlagDetailInstance).toHaveBeenCalled();
  });

  it('should fail validate and set flags case field value', () => {
    component.addCommentsComponent.errorMessages = [{
      fieldId: 'flagComments', title: '', description: 'Please enter comments for this flag'
    }];
    spyOn(component.addCommentsComponent, 'validateFlagComments');
    component.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
    component.validateAndSetFlagsCaseFieldValue();
    expect(component.errorMessages).toEqual(component.addCommentsComponent.errorMessages);
    expect(component.addCommentsComponent.validateFlagComments).toHaveBeenCalled();
  });

  // TODO: Need to add tests for when caseField.value is null and caseField.value.details is null
});