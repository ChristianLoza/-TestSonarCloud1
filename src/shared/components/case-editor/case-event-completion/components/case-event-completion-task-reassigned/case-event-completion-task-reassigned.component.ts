import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionStorageService } from '../../../../../services';

@Component({
  selector: 'app-case-event-completion-task-reassigned',
  templateUrl: './case-event-completion-task-reassigned.html'
})
export class CaseEventCompletionTaskReassignedComponent implements OnInit {

  public caseId: string;
  public assignedUserId: string;
  public assignedUserName: string;

  constructor(private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService) {
    this.caseId = this.route.snapshot.params['cid'];
    const eventId = this.route.snapshot.params['eid'];
  }

  public ngOnInit(): void {
    const caseworkers: any = JSON.parse(this.sessionStorageService.getItem('caseworkers'));
    const caseworker = caseworkers.find(x => x.idamId === this.assignedUserId);
    this.assignedUserName = caseworker !== undefined ? `${caseworker.firstName} ${caseworker.lastName}` : 'another user';
    // TODO: If the task is not assigned to a caseworker, then
    // we have to perform an api call to check whether the task is assigned to judicial user
    // and display the judicial user name instead of 'another user'
  }
}
