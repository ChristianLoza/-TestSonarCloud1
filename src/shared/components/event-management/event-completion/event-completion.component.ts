import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateMachine } from '@edium/fsm';
import { WorkAllocationService } from '../..';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';
import { EventCompletionStateMachineContext } from '../models';
import { EventCompletionStateMachineService } from '../services';

@Component({
  selector: 'ccd-event-completion',
  templateUrl: './event-completion.component.html'
})
export class EventCompletionComponent implements OnInit {

  @Input()
  public caseId: string;
  @Input()
  public eventId: string;
  @Input()
  public task: Task;

  @Output()
  state: EventEmitter<any> = new EventEmitter();

  public stateMachine: StateMachine;
  public context: EventCompletionStateMachineContext;

  constructor(private service: EventCompletionStateMachineService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService,
    private readonly workAllocationService: WorkAllocationService) {
  }

  public ngOnInit(): void {

    // Setup the context
    this.context = {
      task: this.task,
      caseId: this.caseId,
      eventId: this.eventId,
      router: this.router,
      route: this.route,
      sessionStorageService: this.sessionStorageService,
      workAllocationService: this.workAllocationService
    };

    // Initialise state machine
    this.service = new EventCompletionStateMachineService();
    this.stateMachine = this.service.initialiseStateMachine(this.context);
    // Create states
    this.service.createStates(this.stateMachine);
    // Add transitions for the states
    this.service.addTransitions();
    // Start state machine
    this.service.startStateMachine(this.stateMachine);
  }
}
