import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AbstractAppConfig } from '../../../../../app.config';
import { CaseView } from '../../../../domain/case-view';
import { CommonDataService } from '../../../../services/common-data-service/common-data-service';
import { CaseEditComponent, CaseEditSubmitComponent } from '../../../case-editor';
import { CaseEditPageComponent } from '../../../case-editor/case-edit-page/case-edit-page.component';
import { CasesService } from '../../../case-editor/services/cases.service';
import { AbstractFieldWriteComponent } from '../../base-field';
import { CaseLink, LinkedCasesState } from '../domain';
import { LinkedCasesErrorMessages, LinkedCasesEventTriggers, LinkedCasesPages } from '../enums';
import { LinkedCasesService } from '../services';

@Component({
  selector: 'ccd-write-linked-cases',
  templateUrl: './write-linked-cases.component.html'
})
export class WriteLinkedCasesComponent extends AbstractFieldWriteComponent implements OnInit, AfterViewInit {

  private static readonly LINKED_CASES_TAB_ID = 'linked_cases_sscs';

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  @Input()
  public caseEditSubmitComponent: CaseEditSubmitComponent;

  @Output()
  public onLinkedCasesSelected = new EventEmitter<any>();
  @Input()
  public isLinkedCasesJourney = false;

  @Input()
  formGroup: FormGroup;

  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public linkedCases: CaseLink[] = [];

  constructor(private readonly router: Router,
    private caseEdit: CaseEditComponent,
    private readonly appConfig: AbstractAppConfig,
    private commonDataService: CommonDataService,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService) {
    super();
  }

  public ngOnInit(): void {
    this.linkedCasesService.caseId = this.caseEdit.caseDetails.case_id;
    this.linkedCasesService.editMode = false;
    // this.formGroup = this.registerControl(new FormGroup({}, {
    //   validators: (_: AbstractControl): {[key: string]: boolean} | null => {
    //     if (!this.isAtFinalPage()) {
    //       // Return an error to mark the FormGroup as invalid if not at the final page
    //       return {notAtFinalPage: true};
    //     }
    //     return null;
    //   }
    // }), true) as FormGroup;

    this.linkedCasesService.caseId = this.caseEditPageComponent.getCaseId();
    const reasonCodeAPIurl = this.appConfig.getRDCommonDataApiUrl() + '/lov/categories/CaseLinkingReasonCode';
    this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
      next: reasons => {
        this.linkedCasesService.linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);
      }
    })
    // Get linked cases
    this.getLinkedCases();
    this.linkedCasesService.isLinkedCasesEventTrigger =
            this.caseEditPageComponent.eventTrigger.name === LinkedCasesEventTriggers.LINK_CASES;
  }

  public ngAfterViewInit(): void {
    let labelField = document.getElementsByClassName('govuk-heading-l');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
    labelField = document.getElementsByClassName('heading-h2');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    this.caseEditPageComponent.validationErrors = [];

    if (linkedCasesState.navigateToNextPage) {
      this.linkedCasesPage = this.getNextPage(linkedCasesState);
      this.setContinueButtonValidationErrorMessage();
      this.proceedToNextPage();
    } else {
      linkedCasesState.errorMessages.forEach(errorMessage => {
        this.caseEditPageComponent.validationErrors.push({ id: errorMessage.fieldId, message: errorMessage.description});
      });
    }
  }

  public setContinueButtonValidationErrorMessage(): void {
    const errorMessage = this.linkedCasesService.linkedCases.length === 0
      ? LinkedCasesErrorMessages.BackNavigationError
      : this.router && this.router.url && this.router.url.includes(LinkedCasesEventTriggers.LINK_CASES)
        ? LinkedCasesErrorMessages.LinkCasesNavigationError
        : LinkedCasesErrorMessages.UnlinkCasesNavigationError;

    const buttonId = this.linkedCasesService.linkedCases.length === 0
      ? 'back-button'
      : 'next-button';

    this.caseEditPageComponent.caseLinkError = {
      componentId: buttonId,
      errorMessage: errorMessage
    };
  }

  public proceedToNextPage(): void {
    if (this.isAtFinalPage()) {
      // Continue button event must be allowed in final page
      this.caseEditPageComponent.caseLinkError = null;
      // Trigger validation to clear the "notAtFinalPage" error if now at the final state
      this.formGroup.updateValueAndValidity();
      // update form value
      this.onLinkedCasesSelected.emit();
      (this.caseEdit.form.controls['data'] as any) =  new FormGroup({caseLinks: new FormControl(this.linkedCasesService.caseFieldValue)});
    }
  }

  public isAtFinalPage(): boolean {
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getNextPage(linkedCasesState: LinkedCasesState): number {
    if ((this.linkedCasesPage === LinkedCasesPages.BEFORE_YOU_START) ||
        (linkedCasesState.currentLinkedCasesPage === LinkedCasesPages.CHECK_YOUR_ANSWERS && linkedCasesState.navigateToPreviousPage)) {
          return this.isLinkedCasesJourney
            ? LinkedCasesPages.LINK_CASE
            : LinkedCasesPages.UNLINK_CASE;
    }
    return LinkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getLinkedCases(): void {
    this.casesService.getCaseViewV2(this.linkedCasesService.caseId).subscribe((caseView: CaseView) => {
      const linkedCasesTab = caseView.tabs.find(tab => tab.id === WriteLinkedCasesComponent.LINKED_CASES_TAB_ID);
      if (linkedCasesTab) {
        const linkedCases: CaseLink[] = this.linkedCasesService.linkedCases;
      // Initialise the first page to display
        this.linkedCasesPage = this.linkedCasesService.isLinkedCasesEventTrigger || (linkedCases && linkedCases.length > 0)
          ? LinkedCasesPages.BEFORE_YOU_START
          : LinkedCasesPages.NO_LINKED_CASES;
        // Initialise the error to be displayed when clicked on Continue button
        this.setContinueButtonValidationErrorMessage();
      }
    });
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }
}
