import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CallbackErrorsContext } from '../../error/domain/error-context';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { FormValueService } from '../../../services/form/form-value.service';
import { PageValidationService } from '../services/page-validation.service';
import { SaveOrDiscardDialogComponent } from '../../dialogs/save-or-discard-dialog';
import { WizardPage } from '../domain/wizard-page.model';
import { FormErrorService } from '../../../services/form/form-error.service';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { DRAFT_PREFIX } from '../../../domain/draft.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition';
import { FieldsUtils } from '../../../services/fields';

@Component({
  selector: 'ccd-case-edit-page',
  templateUrl: 'case-edit-page.html',
  styleUrls: ['./case-edit-page.scss']
})
export class CaseEditPageComponent implements OnInit, AfterViewChecked {

  static readonly RESUMED_FORM_DISCARD = 'RESUMED_FORM_DISCARD';
  static readonly NEW_FORM_DISCARD = 'NEW_FORM_DISCARD';
  static readonly NEW_FORM_SAVE = 'NEW_FORM_CHANGED_SAVE';
  static readonly RESUMED_FORM_SAVE = 'RESUMED_FORM_SAVE';
  static readonly TRIGGER_TEXT_START = 'Submit';
  static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Submit';

  eventTrigger: CaseEventTrigger;
  editForm: FormGroup;
  wizard: Wizard;
  currentPage: WizardPage;
  dialogConfig: MatDialogConfig;
  error: HttpError;
  callbackErrorsSubject: Subject<any> = new Subject();
  ignoreWarning = false;
  triggerTextStart = CaseEditPageComponent.TRIGGER_TEXT_START;
  triggerTextIgnoreWarnings = CaseEditPageComponent.TRIGGER_TEXT_CONTINUE;
  triggerText: string = CaseEditPageComponent.TRIGGER_TEXT_START;
  isSubmitting = false;
  formValuesChanged = false;
  pageChangeSubject: Subject<boolean> = new Subject();
  caseFields: CaseField[];

  constructor(
    private caseEdit: CaseEditComponent,
    private route: ActivatedRoute,
    private formValueService: FormValueService,
    private formErrorService: FormErrorService,
    private cdRef: ChangeDetectorRef,
    private pageValidationService: PageValidationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.initDialog();
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.caseFields = this.getCaseFields();

    this.route.params.subscribe(params => {
      let pageId = params['page'];
      if (!this.currentPage || pageId !== this.currentPage.id) {
        let page = this.caseEdit.getPage(pageId);
        if (page) {
          this.currentPage = page;
        } else {
          if (this.currentPage) {
            return this.next();
          } else {
            return this.first();
          }
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  applyValuesChanged(valuesChanged: boolean): void {
    this.formValuesChanged = valuesChanged;
  }

  private initDialog() {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.disableClose = true;
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.ariaLabel = 'Label';
    this.dialogConfig.height = '245px';
    this.dialogConfig.width = '550px';
    this.dialogConfig.panelClass = 'dialog';

    this.dialogConfig.closeOnNavigation = false;
    this.dialogConfig.position = {
      top: window.innerHeight / 2 - 120 + 'px', left: window.innerWidth / 2 - 275 + 'px'
    }
  }

  first(): Promise<boolean> {
    return this.caseEdit.first();
  }

  currentPageIsNotValid(): boolean {
    return !this.pageValidationService.isPageValid(this.currentPage, this.editForm);
  }

  submit() {
    if (!this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;
      let currentPageFields = this.formValueService.filterCurrentPageFields(this.currentPage.case_fields, this.editForm.value);
      let caseEventData: CaseEventData = this.formValueService.sanitise(currentPageFields) as CaseEventData;
      caseEventData.event_token = this.eventTrigger.event_token;
      caseEventData.ignore_warning = this.ignoreWarning;
      this.caseEdit.validate(caseEventData, this.currentPage.id)
        .subscribe((jsonData) => {
          this.updateFormData(jsonData as CaseEventData);
          this.saveDraft();
          this.next();
        }, error => this.handleError(error));
      this.scrollToTop();
    }
  }

  updateFormData(jsonData: CaseEventData): void {
    for (const caseFieldId of Object.keys(jsonData.data)) {
      if (this.pageWithFieldExists(caseFieldId)) {
        this.updateEventTriggerCaseFields(caseFieldId, jsonData, this.caseEdit.eventTrigger);
        this.updateFormControlsValue(this.editForm, caseFieldId, jsonData.data[caseFieldId]);
      }
    }
  }

  // we do the check, becasue the data comes from the external source
  pageWithFieldExists(caseFieldId) {
    return this.wizard.findWizardPage(caseFieldId);
  }

  updateEventTriggerCaseFields(caseFieldId: string, jsonData: CaseEventData, eventTrigger: CaseEventTrigger) {
    if (eventTrigger.case_fields) {
      eventTrigger.case_fields
        .filter(element => element.id === caseFieldId)
        .forEach(element => element.value = jsonData.data[caseFieldId]);
    }
  }

  updateFormControlsValue(formGroup: FormGroup, caseFieldId: string, value: any): void {
    let theControl = formGroup.controls['data'].get(caseFieldId);
    if (theControl) {
      theControl.setValue(value);
    }
  }

  callbackErrorsNotify(errorContext: CallbackErrorsContext) {
    this.ignoreWarning = errorContext.ignore_warning;
    this.triggerText = errorContext.trigger_text;
  }

  next(): Promise<boolean> {
    this.resetErrors();
    this.isSubmitting = false;
    this.formValuesChanged = false;
    this.pageChangeSubject.next(true);
    return this.caseEdit.next(this.currentPage.id);
  }

  previous(): Promise<boolean> {
    this.resetErrors();
    this.saveDraft();
    this.formValuesChanged = false;
    this.pageChangeSubject.next(true);
    return this.caseEdit.previous(this.currentPage.id);
  }

  hasPrevious(): boolean {
    return this.caseEdit.hasPrevious(this.currentPage.id);
  }

  cancel(): void {
    if (this.eventTrigger.can_save_draft) {
      if (this.formValuesChanged) {
        const dialogRef = this.dialog.open(SaveOrDiscardDialogComponent, this.dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'Discard') {
            this.discard();
          } else if (result === 'Save') {
            const draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
            if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
              this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.RESUMED_FORM_SAVE, data: draftCaseEventData });
            } else {
              this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.NEW_FORM_SAVE, data: draftCaseEventData });
            }
          }
        });
      } else {
        this.discard();
      }
    } else {
      this.caseEdit.cancelled.emit();
    }
  }

  private discard() {
    if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
      this.caseEdit.cancelled.emit({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
    } else {
      this.caseEdit.cancelled.emit({status: CaseEditPageComponent.NEW_FORM_DISCARD});
    }
  }

  submitting(): boolean {
    return this.isSubmitting;
  }

  private scrollToTop(): void {
    window.scrollTo(0, 0);
  }

  private handleError(error) {
    this.isSubmitting = false;
    this.error = error;
    this.callbackErrorsSubject.next(this.error);
    if (this.error.details) {
      this.formErrorService
        .mapFieldErrors(this.error.details.field_errors, this.editForm.controls['data'] as FormGroup, 'validation');
    }
  }

  private resetErrors(): void {
    this.error = null;
    this.ignoreWarning = false;
    this.triggerText = CaseEditPageComponent.TRIGGER_TEXT_START;
    this.callbackErrorsSubject.next(null);
  }

  isCreatable(): boolean {
    return !this.hasCallbackErrors() &&
      !this.hasInvalidData();
  }

  private hasCallbackErrors(): boolean {
    return this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length;
  }

  private hasInvalidData(): boolean {
    return this.error
      && this.error.details
      && this.error.details.field_errors
      && this.error.details.field_errors.length;
  }

  getCaseId(): String {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }

  private saveDraft() {
    if (this.eventTrigger.can_save_draft) {
      let draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
      draftCaseEventData.event_token = this.eventTrigger.event_token;
      draftCaseEventData.ignore_warning = this.ignoreWarning;
      this.caseEdit.saveDraft(draftCaseEventData).subscribe(
        (draft) => this.eventTrigger.case_id = DRAFT_PREFIX + draft.id, error => this.handleError(error)
      );
    }
  }

  getCancelText(): String {
    if (this.eventTrigger.can_save_draft) {
      return 'Cancel and return';
    } else {
      return 'Cancel';
    }
  }

  private getCaseFields(): CaseField[] {
    if (this.caseEdit.caseDetails) {
      return FieldsUtils.getCaseFields(this.caseEdit.caseDetails);
    }

    return this.eventTrigger.case_fields;
  }
}
