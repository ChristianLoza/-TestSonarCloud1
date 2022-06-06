import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { CaseView } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesResponse } from '../../domain/linked-cases.model';
import { ActivatedRoute, Router } from '@angular/router';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-from-table',
  templateUrl: './linked-cases-from-table.component.html',
  styleUrls: ['./linked-cases-from-table.component.scss']
})

export class LinkedCasesFromTableComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);

  pageType = PageType;
  public tableSubHeading = 'This case is linked from';

  public caseDetails: CaseView;
  public parentUrl: string;
  public isLoaded: boolean;
  public getLinkedCasesResponse: LinkedCasesResponse;

  public caseId: string;
  public showHideLinkText = 'Show';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly casesService: CasesService) {
  }

  public ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  public ngOnInit(): void {
    this.fetchPageData();
        // TODO: to be removed once tested the ticket 5640
    if (this.router.url.indexOf('?error') > -1) {
      this.notifyAPIFailure.emit(true);
    }
  }

  public fetchPageData() {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.casesService.getLinkedCases(this.caseId).subscribe(
      response => {
        this.getLinkedCasesResponse = response
        // TODO: if condition below to be removed once tested the ticket EUI-5550
        if (this.router && this.router.url && this.router.url.includes('1652334576090841')) {
          this.getLinkedCasesResponse.linkedCases = [];
        }
      },
      err => this.notifyAPIFailure.emit(true)
      );
  }

  public onClick(): void {
    this.showHideLinkText = this.showHideLinkText === 'Show'
      ? 'Hide'
      : 'Show';
  }
}
