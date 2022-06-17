import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { forkJoin } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../../../services/search/search.service';
import { CommonDataService, LovRefDataModel } from '../../../../../services/common-data-service/common-data-service';
import { ESQueryType } from '../../domain/linked-cases.model';
import { AbstractAppConfig } from '../../../../../../app.config';

interface LinkedCasesResponse {
  caseReference: string
  caseName: string
  caseType: string;
  service: string;
  state: string;
  reasons: []
}

@Component({
  selector: 'ccd-linked-cases-to-table',
  templateUrl: './linked-cases-to-table.component.html',
  styleUrls: ['./linked-cases-to-table.component.scss']
})

export class LinkedCasesToTableComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);

  public tableHeading = 'Linked cases';
  public tableSubHeading = 'This case is linked to';

  public caseDetails: CaseView;
  public isLoaded: boolean;
  public linkedCasesFromResponse: LinkedCasesResponse[] = []

  public linkedCaseReasons: LovRefDataModel[];
  public caseId: string;

  constructor(
    private readonly appConfig: AbstractAppConfig,
    private commonDataService: CommonDataService,
    private route: ActivatedRoute,
    private router: Router,
    private readonly searchService: SearchService) {}

    public ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }

  public ngOnInit(): void {
    // TODO: to be removed once tested the ticket 5640 and same on the test scope as well
    if (this.router.url.indexOf('?error') > -1) {
      this.notifyAPIFailure.emit(true);
      return;
    }
    const reasonCodeAPIurl = this.appConfig.getRDCommonDataApiUrl() + '/lov/categories/CaseLinkingReasonCode';
    this.caseId = this.route.snapshot.data.case.case_id;
    this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
      next: reasons => this.linkedCaseReasons = reasons.list_of_values,
      error: error => this.notifyAPIFailure.emit(true)
    })
    this.getAllLinkedCaseInformation();
  }

  public groupByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) =>   {
      (rv[x[key]] = rv[x[key]] || []).push(x['caseReference']);
      return rv;
    }, {});
  };

  public getCaseRefereneLink(caseRef) {
    return caseRef.slice(this.caseId.length - 4);
  }

  public sortByReasonCode() {
    const topLevelresultArray = [];
    let secondLevelresultArray = [];
    const data = this.caseField && this.caseField.value || [];
    data.forEach((item: any) => {
      const progressedStateReason = item.reasons.find(reason => reason.reasonCode === 'CLRCO16') // PROGRESSED AS A LEAD CASE
      const consolidatedStateReason = item.reasons.find(reason => reason.reasonCode === 'CLRCO15') // CASE CONSOLIDATED
      if (progressedStateReason) {
        topLevelresultArray.push(item)
      } else if (consolidatedStateReason) {
        secondLevelresultArray = [item, ...secondLevelresultArray ]
      } else {
        secondLevelresultArray.push(item)
      }
    })
    return topLevelresultArray.concat(secondLevelresultArray)
  }

  public getAllLinkedCaseInformation() {
    const searchCasesResponse = [];
    const sortedCases = this.sortByReasonCode()
    const linkedCaseIds = this.groupByCaseType(sortedCases, 'caseType');
    Object.keys(linkedCaseIds).forEach(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100)
      const query = this.searchService.searchCasesByIds(key, esQuery, SearchService.VIEW_WORKBASKET);
      searchCasesResponse.push(query);
    })
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
          searchCases.forEach(response => {
          response.results.forEach((result: any) =>
            this.linkedCasesFromResponse.push(this.mapResponse(result)));
          // TODO: to be removed after testing the ticket 5550/5639
          if (this.router && this.router.url && this.router.url.includes('no-linked-cases')) {
            this.linkedCasesFromResponse = [];
          }
        });
        this.isLoaded = true;
      },
      err => this.notifyAPIFailure.emit(true)
      );
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }

  public hasLeadCaseOrConsolidated(reasonCode: string) {
    return reasonCode === 'Progressed as part of this lead case' || reasonCode === 'Case consolidated'
  }

  public mapResponse(esSearchCasesResponse) {
    const reasonDescriptons = []
    const caseReasonCode = this.caseField.value.find(item => item.caseReference === esSearchCasesResponse.case_id);
    caseReasonCode.reasons.forEach(code => {
      const foundReasonMapping = this.linkedCaseReasons && this.linkedCaseReasons.find(reason => reason.key === code.reasonCode);
      if (foundReasonMapping) {
        reasonDescriptons.push(foundReasonMapping.value_en);
      }
    });
    return {
      caseReference: esSearchCasesResponse.case_id,
      caseName: esSearchCasesResponse.case_fields.caseNameHmctsInternal ||  'Case name missing',
      caseType: esSearchCasesResponse.case_fields['[CASE_TYPE]'],
      service: esSearchCasesResponse.case_fields['[JURISDICTION]'],
      state: esSearchCasesResponse.case_fields['[STATE]'],
      reasons: reasonDescriptons,
    } as LinkedCasesResponse
  }

  public constructElasticSearchQuery(caseIds: any[], size: number): ESQueryType {
    return {
        query: {
          terms: {
            reference: caseIds,
          },
        },
        size,
    };
  }
}
