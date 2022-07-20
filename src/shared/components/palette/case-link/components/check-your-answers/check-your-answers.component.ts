import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CaseLink, LinkedCasesState } from '../../domain';
import { LinkedCasesEventTriggers, LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-linked-cases-check-your-answers',
  templateUrl: './check-your-answers.component.html',
  styleUrls: ['./check-your-answers.component.scss']
})
export class CheckYourAnswersComponent implements OnInit {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public linkedCases: CaseLink[];
  public casesToUnlink: CaseLink[];
  public isLinkCasesJourney: boolean;
  public linkedCasesTableCaption: string;

  constructor(private router: Router,
    private linkedCasesService: LinkedCasesService) {
  }

  public ngOnInit(): void {
    this.isLinkCasesJourney = this.router && this.router.url && this.router.url.includes(LinkedCasesEventTriggers.LINK_CASES);
    this.linkedCasesTableCaption = this.isLinkCasesJourney ? 'Proposed case links' : 'Linked cases';
    this.linkedCases = this.linkedCasesService.linkedCases.filter(linkedCase => !linkedCase.unlink);
    this.casesToUnlink = this.linkedCasesService.linkedCases.filter(linkedCase => linkedCase.unlink && linkedCase.unlink === true);
  }

  public onChange(): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS,
      navigateToPreviousPage: true,
      navigateToNextPage: true
    });
  }
}