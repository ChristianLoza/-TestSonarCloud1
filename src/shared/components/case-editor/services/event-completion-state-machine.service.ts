import { Injectable } from '@angular/core';
import { State, StateMachine } from '@edium/fsm';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { EventCompletionStates, EventCompletionStateMachineContext } from '../domain';

const EVENT_COMPLETION_STATE_MACHINE = 'EVENT COMPLETION STATE MACHINE';

@Injectable()
export class EventCompletionStateMachineService {
  public stateCheckTasksCanBeCompleted: State;
  public stateCompleteEventAndTask: State;
  public stateCancelEvent: State;
  public stateCompleteEventNotTask: State;
  public stateTaskCompletedOrCancelled: State;
  public stateTaskAssignedToAnotherUser: State;
  public stateTaskReassignToUser: State;
  public stateTaskAssignToUser: State;
  public stateTaskUnassigned: State;
  public stateFinal: State;

  public initialiseStateMachine(context: EventCompletionStateMachineContext): StateMachine {
    return new StateMachine(EVENT_COMPLETION_STATE_MACHINE, context);
  }

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start(this.stateCheckTasksCanBeCompleted);
  }

  public createStates(stateMachine: StateMachine): void {
    // Initial state
    this.stateCheckTasksCanBeCompleted = stateMachine.createState(
      EventCompletionStates.CheckTasksCanBeCompleted,
      false,
      this.entryActionForStateCheckTasksCanBeCompleted
    )

    this.stateCompleteEventAndTask = stateMachine.createState(
      EventCompletionStates.CompleteEventAndTask,
      false,
      this.entryActionForStateCompleteEventAndTask
    )

    this.stateTaskCompletedOrCancelled = stateMachine.createState(
      EventCompletionStates.TaskCompetedOrCancelled,
      false,
      this.entryActionForStateTaskCompletedOrCancelled
    )

    this.stateTaskAssignedToAnotherUser = stateMachine.createState(
      EventCompletionStates.TaskAssignedToAnotherUser,
      false,
      this.entryActionForStateTaskAssignedToAnotherUser
    )

    this.stateTaskUnassigned = stateMachine.createState(
      EventCompletionStates.TaskUnassigned,
      false,
      this.entryActionForStateTaskUnassigned
    )

    // Create final state, the second param isComplete is set to true to make sure state machine finished running
    this.stateFinal = stateMachine.createState(
      EventCompletionStates.Final,
      true,
      this.entryActionForStateFinal
    );
  }

  public addTransitions(): void {
    // Initial transition
    this.addTransitionsForStateCheckTasksCanBeCompleted();
    this.addTransitionsForStateCompleteEventAndTask();
    this.addTransitionsForStateTaskAssignedToAnotherUser();
    this.addTransitionsForStateTaskUnassigned();
  }

  public entryActionForStateCheckTasksCanBeCompleted(state: State, context: EventCompletionStateMachineContext): void {
    context.workAllocationService.getTasksByCaseIdAndEventId(context.eventId, context.caseId).subscribe(payload => {
      const taskPayLoad = <TaskPayload>payload;
      if (taskPayLoad.task_required_for_event) {
        const task = taskPayLoad.tasks.find(x => x.id === context.task.id);
        if (task) {
          if (!task.assignee && task.task_state === 'unassigned') {
            // Task unassigned
            state.trigger(EventCompletionStates.TaskUnassigned);
          } else if (task.assignee === context.task.assignee) {
            // Task assigned to current user
            if (task.task_state === 'assigned') {
              // Task is in assigned state
              state.trigger(EventCompletionStates.CompleteEventAndTask);
            } else {
              if (task.task_state === 'completed' || task.task_state === 'cancelled') {
                state.trigger(EventCompletionStates.TaskCompetedOrCancelled);
              }
            }
          } else {
            // Task not assigned to user
            state.trigger(EventCompletionStates.TaskAssignedToAnotherUser);
          }
        }
      }
    });
  }

  public entryActionForStateTaskCompletedOrCancelled(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    // Navigate to no task available error page
  }

  public entryActionForStateCompleteEventAndTask(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    // Emit event to parent component
    context.component.eventCanBeCompleted.emit(true);
  }

  public entryActionForStateTaskAssignedToAnotherUser(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
  }

  public entryActionForStateTaskUnassigned(state: State, context: EventCompletionStateMachineContext): void {
    // Trigger final state to complete processing of state machine
    state.trigger(EventCompletionStates.Final);
    // Navigate to tasks tab on case details page

  }

  public entryActionForStateFinal(state: State, context: EventCompletionStateMachineContext): void {
    // Final actions can be performed here, the state machine finished running
    console.log('FINAL');
  }

  public addTransitionsForStateCheckTasksCanBeCompleted(): void {
    // Complete event and task
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.CompleteEventAndTask,
      this.stateCompleteEventAndTask
    );
    // Task assigned to another user
    this.stateCheckTasksCanBeCompleted.addTransition(
      EventCompletionStates.TaskAssignedToAnotherUser,
      this.stateTaskAssignedToAnotherUser
    );
  }

  public addTransitionsForStateTaskCompletedOrCancelled(): void {
    this.stateTaskCompletedOrCancelled.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public addTransitionsForStateCompleteEventAndTask(): void {
    this.stateCompleteEventAndTask.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public addTransitionsForStateTaskAssignedToAnotherUser(): void {
    this.stateTaskAssignedToAnotherUser.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }

  public addTransitionsForStateTaskUnassigned(): void {
    this.stateTaskUnassigned.addTransition(
      EventCompletionStates.Final,
      this.stateFinal
    );
  }
}
