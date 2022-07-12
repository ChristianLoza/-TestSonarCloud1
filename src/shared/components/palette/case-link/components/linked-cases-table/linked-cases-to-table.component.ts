import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { forkJoin } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../../../services/search/search.service';
import { CaseLink, ESQueryType, LinkReason } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';

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
  public linkedCasesFromResponse: LinkedCasesResponse[] = [];
  public caseId: string;

  constructor(
    private route: ActivatedRoute,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly searchService: SearchService) {}

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

  public ngOnInit(): void {
    this.caseId = this.route.snapshot && this.route.snapshot.data && this.route.snapshot.data.case.case_id;
    this.getAllLinkedCaseInformation()
  }

  public groupLinkedCasesByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) =>   {
      (rv[x[key]] = rv[x[key]] || []).push(x['CaseReference']);
      return rv;
    }, {});
  };

  public getCaseRefereneLink(caseRef) {
    return caseRef.slice(this.caseId.length - 4);
  }

  public sortLinkedCasesByReasonCode() {
    const topLevelresultArray = [];
    let secondLevelresultArray = [];
    const data = this.caseField && this.caseField.value || [];
    data.forEach((item: any) => {
      const reasons = item && item.value && item.value.ReasonForLink || [];
      const progressedStateReason = reasons.find(reason => reason.value.Reason === 'CLRCO16') // PROGRESSED AS A LEAD CASE
      const consolidatedStateReason = reasons.find(reason => reason.value.Reason === 'CLRCO15') // CASE CONSOLIDATED
      let arrayItem;
      if (progressedStateReason) {
        arrayItem = {...item.value};
        topLevelresultArray.push(arrayItem)
      } else if (consolidatedStateReason) {
        arrayItem = {...item.value};
        secondLevelresultArray = [{...item.value}, ...secondLevelresultArray ]
      } else {
        arrayItem = {...item.value};
        secondLevelresultArray.push({...item.value})
      }
    })
    return topLevelresultArray.concat(secondLevelresultArray)
  }

  public getAllLinkedCaseInformation() {
    const searchCasesResponse = [];
    const sortedCasesList = this.sortLinkedCasesByReasonCode();
    const linkedCaseIds = this.groupLinkedCasesByCaseType(sortedCasesList, 'CaseType');
    Object.keys(linkedCaseIds).forEach(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100)
      const query = this.searchService.searchCasesByIds(key, esQuery, SearchService.VIEW_WORKBASKET);
      searchCasesResponse.push(query);
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
          searchCases.forEach(response => {
          response.results.forEach((result: any) =>
            this.linkedCasesFromResponse.push(this.mapResponse(result)));
        });
        this.isLoaded = true;
        const caseLinks = this.linkedCasesFromResponse.map(item => {
          return {
            caseReference: item.caseReference,
            caseName: item.caseName,
            caseService: item.service,
            caseType: item.caseType,
            unlink: false,
            reasons: item.reasons && item.reasons.map(item => {
              return {
                reasonCode: item
              } as LinkReason
            }),
          } as CaseLink
        });
        this.linkedCasesService.linkedCases = caseLinks;
      },
      err => this.notifyAPIFailure.emit(true)
      );
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }

  public hasLeadCaseOrConsolidated(reasonCode: string) {
    return reasonCode === 'CLRC016' || reasonCode === 'CLRC015';
  }

  public mapResponse(esSearchCasesResponse) {
    const caseInfo = this.caseField.value.find(item => item.value && item.value.CaseReference === esSearchCasesResponse.case_id);
    return caseInfo && {
      caseReference: esSearchCasesResponse.case_id,
      caseName: esSearchCasesResponse.case_fields.caseNameHmctsInternal ||  'Case name missing',
      caseType: esSearchCasesResponse.case_fields['[CASE_TYPE]'],
      service: esSearchCasesResponse.case_fields['[JURISDICTION]'],
      state: esSearchCasesResponse.case_fields['[STATE]'],
      reasons: caseInfo.value && caseInfo.value.ReasonForLink &&
              caseInfo.value.ReasonForLink.map(reason => reason.value && reason.value.Reason),
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
