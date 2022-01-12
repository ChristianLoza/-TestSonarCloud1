import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StateMachine } from '@edium/fsm';
import { of } from 'rxjs';
import { WorkAllocationService } from '.';
import { AbstractAppConfig } from '../../../../app.config';
import { Task } from '../../../domain/work-allocation/Task';
import { HttpErrorService, HttpService } from '../../../services';
import {
  EventCompletionComponentEmitter,
  EventCompletionStateMachineContext,
  EventCompletionStates
} from '../domain';
import { EventCompletionStateMachineService } from './event-completion-state-machine.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventCompletionStateMachineService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let service: EventCompletionStateMachineService;
  let stateMachine: StateMachine;
  let mockSessionStorageService: any;
  let appConfig: any;
  let httpService: any;
  let errorService: any;
  let alertService: any;
  let mockWorkAllocationService: WorkAllocationService;
  let mockRoute: ActivatedRoute;
  let mockRouter: any;
  let eventCompletionComponentEmittter: EventCompletionComponentEmitter;

  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  const noTask: Task[] = [];

  const oneTask: Task = {
    assignee: null,
    auto_assigned: false,
    case_category: 'asylum',
    case_id: '1620409659381330',
    case_management_category: null,
    case_name: 'Alan Jonson',
    case_type_id: null,
    created_date: '2021-04-19T14:00:00.000+0000',
    due_date: '2021-05-20T16:00:00.000+0000',
    execution_type: null,
    id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
    jurisdiction: 'Immigration and Asylum',
    location: null,
    location_name: null,
    name: 'Task name',
    permissions: null,
    region: null,
    security_classification: null,
    task_state: null,
    task_system: null,
    task_title: 'Some lovely task name',
    type: null,
    warning_list: null,
    warnings: true,
    work_type_id: null
  };

  const multipleTasks: Task[] = [
    {
      assignee: '1234-1234-1234-1234',
      auto_assigned: false,
      case_category: 'asylum',
      case_id: '1620409659381330',
      case_management_category: null,
      case_name: 'Alan Jonson',
      case_type_id: null,
      created_date: '2021-04-19T14:00:00.000+0000',
      due_date: '2021-05-20T16:00:00.000+0000',
      execution_type: null,
      id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
      jurisdiction: 'Immigration and Asylum',
      location: null,
      location_name: null,
      name: 'Task name',
      permissions: null,
      region: null,
      security_classification: null,
      task_state: null,
      task_system: null,
      task_title: 'Some lovely task name',
      type: null,
      warning_list: null,
      warnings: true,
      work_type_id: null
    },
    {
      assignee: '4321-4321-4321-4321',
      auto_assigned: false,
      case_category: 'asylum',
      case_id: '1620409659381330',
      case_management_category: null,
      case_name: 'Alan Jonson',
      case_type_id: null,
      created_date: '2021-04-19T14:00:00.000+0000',
      due_date: '2021-05-20T16:00:00.000+0000',
      execution_type: null,
      id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
      jurisdiction: 'Immigration and Asylum',
      location: null,
      location_name: null,
      name: 'Task name',
      permissions: null,
      region: null,
      security_classification: null,
      task_state: null,
      task_system: null,
      task_title: 'Some lovely task name',
      type: null,
      warning_list: null,
      warnings: true,
      work_type_id: null
    }
  ];

  appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl', 'getCamRoleAssignmentsApiUrl']);
  appConfig.getApiUrl.and.returnValue(API_URL);
  appConfig.getCaseDataUrl.and.returnValue(API_URL);
  appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
  httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockWorkAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);

  let context: EventCompletionStateMachineContext = {
    task: null,
    caseId: '1620409659381330',
    eventId: 'editAppealAfterSubmit',
    router: mockRouter,
    route: mockRoute,
    sessionStorageService: mockSessionStorageService,
    workAllocationService: mockWorkAllocationService,
    canBeCompleted: false,
    component: eventCompletionComponentEmittter
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: WorkAllocationService, useValue: mockWorkAllocationService}
      ]
    });
    service = new EventCompletionStateMachineService();
  });

  it('should initialise state machine', () => {
    stateMachine = service.initialiseStateMachine(context);
    expect(stateMachine).toBeDefined();
  });

  it('should create states', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    expect(service.stateCheckTasksCanBeCompleted.id).toEqual(EventCompletionStates.CHECK_TASKS_CAN_BE_COMPLETED);
    expect(service.stateCompleteEventAndTask.id).toEqual(EventCompletionStates.COMPLETE_EVENT_AND_TASK);
    expect(service.stateTaskCompletedOrCancelled.id).toEqual(EventCompletionStates.TASK_COMPLETED_OR_CANCELLED);
    expect(service.stateTaskAssignedToAnotherUser.id).toEqual(EventCompletionStates.TASK_ASSIGNED_TO_ANOTHER_USER);
    expect(service.stateTaskUnassigned.id).toEqual(EventCompletionStates.TASK_UNASSIGNED);
    expect(service.stateFinal.id).toEqual(EventCompletionStates.FINAL);
  });

  it('should add transitions', () => {
    spyOn(service, 'addTransitionsForStateCheckTasksCanBeCompleted');
    spyOn(service, 'addTransitionsForStateCompleteEventAndTask');
    spyOn(service, 'addTransitionsForStateTaskAssignedToAnotherUser');
    spyOn(service, 'addTransitionsForStateTaskUnassigned');

    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();

    expect(service.addTransitionsForStateCheckTasksCanBeCompleted).toHaveBeenCalled();
    expect(service.addTransitionsForStateCompleteEventAndTask).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskAssignedToAnotherUser).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskUnassigned).toHaveBeenCalled();
  });

  it('should emit can be completed true if task assigned to user', () => {
    const taskPayload = {
      task_required_for_event: true,
      tasks: [oneTask]
    };
    spyOn(context.workAllocationService, 'getTasksByCaseIdAndEventId').and.returnValue(of({taskPayload}));
    oneTask.task_state = 'assigned';
    context.task = oneTask;
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventCompletionStates.CHECK_TASKS_CAN_BE_COMPLETED);
    expect(context.workAllocationService.getTasksByCaseIdAndEventId).toHaveBeenCalled();
  });

  it('should add transition for state check taks can be completed', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateCheckTasksCanBeCompleted();
    expect(service.addTransitionsForStateCheckTasksCanBeCompleted).toBeTruthy();
  });

  it('should add transition for state complete event and task', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateCompleteEventAndTask();
    expect(service.addTransitionsForStateCompleteEventAndTask).toBeTruthy();
  });

  it('should add transition for state task assigned to another user', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskAssignedToAnotherUser();
    expect(service.addTransitionsForStateTaskAssignedToAnotherUser).toBeTruthy();
  });

  it('should add transition for state task unassigned', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskUnassigned();
    expect(service.addTransitionsForStateTaskUnassigned).toBeTruthy();
  });
});
