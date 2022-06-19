import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { CaseView, ErrorMessage, HttpError } from '../../../../../domain';
import { SearchService } from '../../../../../services';
import {
  CommonDataService,
  LovRefDataModel,
} from '../../../../../services/common-data-service/common-data-service';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesState } from '../../domain';
import {
  CaseLink,
  ESQueryType,
  LinkCaseReason,
  LinkReason,
} from '../../domain/linked-cases.model';
import { LinkedCasesErrorMessages, LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { ValidatorsUtils } from '../../utils/validators.utils';

@Component({
  selector: 'ccd-link-cases',
  styleUrls: ['./link-cases.component.scss'],
  templateUrl: './link-cases.component.html',
})
export class LinkCasesComponent implements OnInit {
  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public errorMessages: ErrorMessage[] = [];
  public linkCaseForm: FormGroup;
  public selectedCases: CaseLink[] = [];
  public caseNumberError: string;
  public caseReasonError: string;
  public caseSelectionError: string;
  public noSelectedCaseError: string;

  constructor(
    private readonly appConfig: AbstractAppConfig,
    private casesService: CasesService,
    private commonDataService: CommonDataService,
    private readonly fb: FormBuilder,
    private readonly validatorsUtils: ValidatorsUtils,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getCaseReasons();
  }

  getCaseReasons() {
    const reasonCodeAPIurl =
      this.appConfig.getRDCommonDataApiUrl() +
      '/lov/categories/CaseLinkingReasonCode';
    this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
      next: (reasons) => {
        this.linkedCasesService.linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);
        this.selectedCases = this.linkedCasesService.linkedCases;
        this.getAllLinkedCaseInformation();
        this.initForm();
      },
      error: (error) => {
        this.linkedCasesService.linkCaseReasons = [];
        this.initForm();
      },
    });
  }

  public initForm() {
    this.linkCaseForm = this.fb.group({
      caseNumber: ['', this.validatorsUtils.numberLengthValidator(16)],
      reasonType: this.getReasonTypeFormArray,
    });
  }

  public get getReasonTypeFormArray(): FormArray {
    return this.fb.array(
      this.linkedCasesService.linkCaseReasons.map((val) =>
        this.fb.group({
          key: [val.key],
          value_en: [val.value_en],
          value_cy: [val.value_cy],
          hint_text_en: [val.hint_text_en],
          hint_text_cy: [val.hint_text_cy],
          lov_order: [val.lov_order],
          parent_key: [val.parent_key],
          selected: [!!val.selected],
        })
      ),
      this.validatorsUtils.formArraySelectedValidator()
    );
  }

  public submitCaseInfo() {
    this.errorMessages = [];
    this.caseReasonError = null;
    this.caseNumberError = null;
    this.caseSelectionError = null;
    this.noSelectedCaseError = null;
    if (
      this.linkCaseForm.valid &&
      !this.isCaseSelected(this.selectedCases) &&
      !this.isCaseSelected(this.linkedCasesService.preLinkedCases)
    ) {
      this.getCaseInfo();
    } else {
      this.showErrorInfo();
    }
  }

  isCaseSelected(linkedCases: CaseLink[]): boolean {
    if (linkedCases.length === 0) {
      return false;
    }
    const caseNumber = this.linkCaseForm.value.caseNumber;
    return !!linkedCases.find(
      (caseLink) => caseLink.caseReference === caseNumber
    );
  }

  showErrorInfo() {
    if (this.linkCaseForm.controls.caseNumber.invalid) {
      this.caseNumberError = LinkedCasesErrorMessages.CaseNumberError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.CaseNumberError,
        fieldId: 'caseNumber',
      });
    }
    if (this.linkCaseForm.controls.reasonType.invalid) {
      this.caseReasonError = LinkedCasesErrorMessages.ReasonSelectionError;
      this.errorMessages.push({
        title: 'dummy-case-reason',
        description: LinkedCasesErrorMessages.ReasonSelectionError,
        fieldId: 'caseReason',
      });
    }
    if (this.isCaseSelected(this.selectedCases)) {
      this.caseSelectionError = LinkedCasesErrorMessages.CaseProposedError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.CaseProposedError,
        fieldId: 'caseNumber',
      });
    }
    if (this.isCaseSelected(this.linkedCasesService.preLinkedCases)) {
      this.caseSelectionError = LinkedCasesErrorMessages.CasesLinkedError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.CasesLinkedError,
        fieldId: 'caseNumber',
      });
    }
    this.emitLinkedCasesState(false);
  }

  getCaseInfo() {
    this.casesService
      .getCaseViewV2(this.linkCaseForm.value.caseNumber)
      .subscribe(
        (caseView: CaseView) => {
          const caseLink: CaseLink = {
            caseReference: caseView.case_id,
            reasons: this.getSelectedCaseReasons(),
            createdDateTime: new Date().toISOString(),
            caseType: caseView.case_type.name,
            caseState: caseView.state.name,
            caseService: caseView.case_type.jurisdiction.name,
            caseName: caseView.metadataFields['caseNameHmctsInternal'] ||  'Case name missing',
          };
          this.selectedCases.push(caseLink);
          this.initForm();
          this.emitLinkedCasesState(false);
        },
        (error: HttpError) => {
          this.caseNumberError = LinkedCasesErrorMessages.CaseCheckAgainError;
          this.errorMessages.push({
            title: 'dummy-case-number',
            description: LinkedCasesErrorMessages.CaseCheckAgainError,
            fieldId: 'caseNumber',
          });
          this.emitLinkedCasesState(false);
          return throwError(error);
        }
      );
  }

  public groupByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x['caseReference']);
      return rv;
    }, {});
  };

  public mapResponse(esSearchCasesResponse, selectedCase) {
    return {...selectedCase,
      caseName: esSearchCasesResponse.case_fields.caseNameHmctsInternal ||  'Case name missing',
      caseReference : esSearchCasesResponse.case_id,
      caseType : esSearchCasesResponse.case_fields['[CASE_TYPE]'],
      caseService : esSearchCasesResponse.case_fields['[JURISDICTION]'],
      caseState : esSearchCasesResponse.case_fields['[STATE]'],
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }
  /**
   * TODO: Get all Linked cases information
   * Gets all case information
   */
  public getAllLinkedCaseInformation() {
    const linkedCaseIds = this.groupByCaseType(this.selectedCases, 'caseType');
    const searchCasesResponse = [];
    Object.keys(linkedCaseIds).forEach((id) => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[id], 100);
      const query = this.searchService.searchCasesByIds(
        id,
        esQuery,
        SearchService.VIEW_WORKBASKET
      );
      searchCasesResponse.push(query);
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe(
        (searchCases: any) => {
          let updatedSelectedCases = [];
          this.linkedCasesService.preLinkedCases = [];
          searchCases.forEach((response) => {
            response.results.forEach((result: any) => {
              let caseInfo = this.selectedCases.find(element => element.caseReference = result.case_id);
              if (caseInfo) {
                updatedSelectedCases.push(this.mapResponse(result, caseInfo));
              }
            });
          });
          this.selectedCases = updatedSelectedCases;
          this.linkedCasesService.preLinkedCases = updatedSelectedCases;
        }
      );
    }
  }

  public constructElasticSearchQuery(
    caseIds: any[],
    size: number
  ): ESQueryType {
    return {
      query: {
        terms: {
          reference: caseIds,
        },
      },
      size,
    };
  }

  // Return linked cases state and error messages to the parent
  emitLinkedCasesState(isNavigateToNextPage: boolean) {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: isNavigateToNextPage,
    });
  }

  getSelectedCaseReasons(): LinkReason[] {
    let selectedReasons: LinkReason[] = [];
    this.linkCaseForm.controls.reasonType.value.forEach(
      (selectedReason: LinkCaseReason) => {
        if (selectedReason.selected) {
          selectedReasons.push({ reasonCode: selectedReason.key });
        }
      }
    );
    return selectedReasons;
  }

  public onNext(): void {
    this.errorMessages = [];
    this.caseReasonError = null;
    this.caseNumberError = null;
    this.caseSelectionError = null;
    this.noSelectedCaseError = null;
    let navigateToNextPage = true;
    if (this.selectedCases.length) {
      this.linkedCasesService.linkedCases = this.selectedCases;
    } else {
      this.noSelectedCaseError = LinkedCasesErrorMessages.CaseSelectionError;
      this.errorMessages.push({
        title: 'dummy-case-selection',
        description: LinkedCasesErrorMessages.CaseSelectionError,
        fieldId: 'caseReason',
      });
      navigateToNextPage = false;
    }
    this.emitLinkedCasesState(navigateToNextPage);
  }
}
