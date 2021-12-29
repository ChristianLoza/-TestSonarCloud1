import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { State, StateMachine } from '@edium/fsm';
import { throwError } from 'rxjs';
import { UserInfo } from '../../../domain/user/user-info.model';
import { EventStates, StateMachineContext, StateMachineStates } from '../models';

const EVENT_STATE_MACHINE = 'EVENT STATE MACHINE';

@Injectable()
export class EventStateMachineService {
  public stateCheckForMatchingTasks: State;
  public stateNoTask: State;
  public stateOneTask: State;
  public stateMultipleTask: State;
  public stateTaskAssignedToUser: State;
  public stateTaskUnassigned: State;
  public stateTaskAssignmentRequired: State;
  public stateAssignTaskToSelf: State;
  public stateAskManagerToAssignTask: State;
  public stateShowWarning: State;
  public stateShowErrorMessage: State;
  public stateCancel: State;
  public stateFinal: State;

  public initialiseStateMachine(context: StateMachineContext): StateMachine {
    return new StateMachine(EVENT_STATE_MACHINE, context);
  }

  public createStates(stateMachine: StateMachine): void {
    // Create states
    this.stateCheckForMatchingTasks = stateMachine.createState(
      EventStates.CHECK_FOR_MATCHING_TASKS,
      false,
      this.initialEntryState
    );
    this.stateNoTask = stateMachine.createState(
      EventStates.NO_TASK,
      false,
      this.entryAction
    );
    this.stateOneTask = stateMachine.createState(
      EventStates.ONE_TASK,
      false,
      this.entryAction
    );
    this.stateMultipleTask = stateMachine.createState(
      EventStates.MULTIPLE_TASKS,
      false,
      this.decideAction
    );
    this.stateTaskAssignedToUser = stateMachine.createState(
      EventStates.TASK_ASSIGNED_TO_USER,
      false,
      this.entryActionForStateTaskAssignedToUser
    );
    this.stateTaskUnassigned = stateMachine.createState(
      EventStates.TASK_UNASSIGNED,
      false,
      this.entryActionForStateTaskUnAssigned
    );
    this.stateTaskAssignmentRequired = stateMachine.createState(
      EventStates.TASK_ASSIGNMENT_REQUIRED,
      false,
      this.entryAction
    );
    this.stateAssignTaskToSelf = stateMachine.createState(
      EventStates.ASSIGN_TASK_TO_SELF,
      false,
      this.entryAction
    );
    this.stateAskManagerToAssignTask = stateMachine.createState(
      EventStates.ASK_MANAGER_TO_ASSIGN_TASK,
      false,
      this.entryAction
    );
    this.stateShowWarning = stateMachine.createState(
      EventStates.SHOW_WARNING,
      false,
      this.navigateToNoTaskAvailablePage
    );
    this.stateShowErrorMessage = stateMachine.createState(
      EventStates.SHOW_ERROR_MESSAGE,
      false,
      this.exitAction
    );
    this.stateCancel = stateMachine.createState(
      EventStates.CANCEL,
      false,
      this.exitAction
    );
    // Create final state, the second param isComplete is set to true
    this.stateFinal = stateMachine.createState(
      StateMachineStates.FINAL,
      true,
      this.finalAction
    );
  }

  public addTransitions(): void {
    this.addTransitionsForStateCheckForMatchingTasks();
    this.addTransitionsForStateNoTask();
    this.addTransitionsForStateOneTask();
    this.addTransitionsForStateMultipleTasks();
    this.addTransitionsForStateTaskAssignedToUser();
    this.addTransitionsForStateTaskUnassigned();
    this.addTransitionsForStateTaskAssignmentRequired();
    this.addTransitionsForStateAssignTaskToSelf();
    this.addTransitionsForStateAskManagerToAssignTask();
    this.addTransitionsForStateShowWarning();
    this.addTransitionsForStateShowErrorMessage();
    this.addTransitionsForStateCancel();

    // Define final state transition
    this.addTransitionsForStateFinal();
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckForMatchingTasks);
  }

  /**
   * Initial entry state, decided based on the number of tasks
   */
  public initialEntryState(state: State, context: StateMachineContext): void {
    const taskCount = context && context.tasks ? context.tasks.length : 0;
    switch (taskCount) {
      case 0:
        // No tasks
        state.trigger(EventStates.NO_TASK);
        break;
      case 1:
        // One task
        state.trigger(EventStates.ONE_TASK);
        break;
      default:
        // Multiple tasks
        state.trigger(EventStates.MULTIPLE_TASKS);
        break;
    }
  }

  public navigateToNoTaskAvailablePage(state: State, context: StateMachineContext): void {
    context.router.navigate([`/cases/case-details/${context.caseId}/no-tasks-available`], { relativeTo: context.route });
  }

  public entryActionForStateTaskAssignedToUser(state: State, context: StateMachineContext): void {
    const userInfoStr = context.sessionStorageService.getItem('userDetails');
    const userInfo: UserInfo = JSON.parse(userInfoStr);

    if (context.tasks[0].assignee === userInfo.id) {
      // Task assigned to user, trigger state final
      state.trigger(StateMachineStates.FINAL);
    } else {
      // Task not assigned to user, trigger state task unassigned
      state.trigger(EventStates.TASK_UNASSIGNED);
    }
  }

  public entryActionForStateTaskUnAssigned(state: State, context: StateMachineContext): void {
    if (context.tasks[0].assignee) {
      // Task is assigned to some other user, navigate to task assigned error page
      context.router.navigate([`/cases/case-details/${context.caseId}/task-assigned`],
        { queryParams: context.tasks[0], relativeTo: context.route });
    } else {
      // Task is unassigned, navigate to task unassigned error page
      context.router.navigate([`/cases/case-details/${context.caseId}/task-unassigned`], { relativeTo: context.route });
    }
  }

  /**
   * State entry action
   */
  public entryAction(state: State, context: StateMachineContext): void {
    // TODO: Actions based on the state id
    switch (state.id) {
      case EventStates.NO_TASK:
        state.trigger(EventStates.SHOW_WARNING);
        break;
      case EventStates.ONE_TASK:
        state.trigger(EventStates.TASK_ASSIGNED_TO_USER);
        break;
      case EventStates.MULTIPLE_TASKS:
        break;
      default:
        throwError('Invalid state');
        break;
    }
  }

  /**
   * State exit action
   */
  public exitAction(state: State): boolean {
    // TODO: Return true or false based on the scenario
    return true;
  }

  /**
   * State decide action
   */
  public decideAction(state: State, context: StateMachineContext): void {
    // Find out the relevant event
    const taskCount = context && context.tasks ? context.tasks.length : 0;
    // TODO: To be implemented based on the number of tasks
  }

  public finalAction(state: State): void {
    // TODO: Perform final actions, the state machine finished running
    console.log('FINAL action here');
  }

  public addTransitionsForStateCheckForMatchingTasks(): void {
    // No tasks
    this.stateCheckForMatchingTasks.addTransition(
      EventStates.NO_TASK,
      this.stateNoTask
    );
    // One task
    this.stateCheckForMatchingTasks.addTransition(
      EventStates.ONE_TASK,
      this.stateOneTask
    );
    // Multiple tasks
    this.stateCheckForMatchingTasks.addTransition(
      EventStates.MULTIPLE_TASKS,
      this.stateMultipleTask
    );
  }

  public addTransitionsForStateNoTask(): void {
    this.stateNoTask.addTransition(
      EventStates.SHOW_WARNING,
      this.stateShowWarning
    );
  }

  public addTransitionsForStateOneTask(): void {
    this.stateOneTask.addTransition(
      EventStates.TASK_ASSIGNED_TO_USER,
      this.stateTaskAssignedToUser
    );
  }

  public addTransitionsForStateMultipleTasks(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateTaskAssignedToUser(): void {
    this.stateTaskAssignedToUser.addTransition(
      StateMachineStates.FINAL,
      this.stateFinal
    );
    this.stateTaskAssignedToUser.addTransition(
      EventStates.TASK_UNASSIGNED,
      this.stateTaskUnassigned
    );
  }

  public addTransitionsForStateTaskUnassigned(): void {
    this.stateTaskUnassigned.addTransition(
      EventStates.ASSIGN_TASK_TO_SELF,
      this.stateAssignTaskToSelf
    );
    this.stateTaskUnassigned.addTransition(
      EventStates.ASK_MANAGER_TO_ASSIGN_TASK,
      this.stateAskManagerToAssignTask
    );
  }

  public addTransitionsForStateTaskAssignmentRequired(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateAssignTaskToSelf(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateAskManagerToAssignTask(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateShowWarning(): void {
    this.stateFinal.addTransition(StateMachineStates.FINAL, this.stateFinal);
  }

  public addTransitionsForStateShowErrorMessage(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateCancel(): void {
    // TODO: Add required transitions
  }

  public addTransitionsForStateFinal(): void {
    // TODO: Add required transitions
  }
}
