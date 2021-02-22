import { async } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { PageValidationService } from './page-validation.service';
import { WizardPage } from '../domain/wizard-page.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { LogService } from '../../../services/logging/log.service';
import { aCaseField } from '../../../fixture/shared.test.fixture';
import { AbstractAppConfig } from '../../../../app.config';

describe('PageValidationService', () => {

  let appConfig: any;
  let logService = new LogService(appConfig);
  let caseFieldService = new CaseFieldService(logService);
  let service = new PageValidationService(caseFieldService, logService);
  let wizardPage: WizardPage;
  let readOnly = new CaseField();
  let fieldType1 = new FieldType();
  let firstPage = new WizardPage();
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({ 'field1': new FormControl('SOME_VALUE') })
  });

  beforeEach(async(() => {
    firstPage.id = 'first page';
    service = new PageValidationService(caseFieldService, logService);
  }));

  beforeEach(() => {
    readOnly.id = 'READONLY';
    readOnly.label = 'READONLY';
    readOnly.display_context = 'READONLY';
    fieldType1.id = 'fieldType1';
    readOnly.field_type = fieldType1;
    const FIELDS: CaseField[] = [readOnly];
    wizardPage = new WizardPage();
    wizardPage.case_fields = FIELDS;
    wizardPage.label = 'Test Label';

    appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getLoggingCaseFieldList']);
    appConfig.getLoggingCaseFieldList.and.returnValue(['respondents', 'staffUploadedDocuments']);
  });

  it('should allow empty values when field is OPTIONAL', () => {
    wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Text', 'OPTIONAL', null));
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should be invalid with empty document field when field is MANDATORY and not hidden', () => {
    let field1 = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('field2', 'field2', 'Document', 'MANDATORY', null);
    field2.show_condition = 'field1="SOME_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;

    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeFalsy();
  });

  it('should allow empty document fields when MANDATORY and field is hidden', () => {
    let field1 = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('field2', 'field2', 'Document', 'MANDATORY', null);
    field2.show_condition = 'field1="SOME_OTHER_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL and field is not hidden', () => {
    let field1 = aCaseField('Text', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('Document', 'field2', 'Document', 'OPTIONAL', null);
    field2.show_condition = 'field1="SOME_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL and field is hidden', () => {
    let field1 = aCaseField('Text', 'field1', 'Text', 'OPTIONAL', null);
    let field2 = aCaseField('Document', 'field2', 'Document', 'OPTIONAL', null);
    field2.show_condition = 'field1="SOME_OTHER_VALUE"';
    wizardPage.case_fields.push(field1, field2);
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should allow empty document fields when OPTIONAL', () => {
    wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Document', 'OPTIONAL', null));
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeTruthy();
  });

  it('should not allow empty document fields when MANDATORY', () => {
    wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Document', 'MANDATORY', null));
    wizardPage.isMultiColumn = () => false;
    expect(service.isPageValid(wizardPage, FORM_GROUP)).toBeFalsy();
  });
});
