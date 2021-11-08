import { Routes } from '@angular/router';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { EventStartGuard } from '../event-guard/event-start.guard';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request';
import { CaseEventTriggerComponent } from './case-event-trigger/case-event-trigger.component';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';
import { TaskAssignedComponent } from '../event-trigger/components/task-assigned/task-assigned.component';
import { MultipleTasksExistComponent } from '../event-trigger/components/multiple-tasks-exist/multiple-tasks-exist.component';
import { NoTasksAvailableComponent } from '../event-trigger/components/no-tasks-available/no-tasks-available.component';
import { TaskCancelledComponent } from '../event-trigger/components/task-cancelled/task-cancelled.component';
import { TaskConflictComponent } from '../event-trigger/components/task-conflict/task-conflict.component';

export const viewerRouting: Routes = [
  {
    path: 'print',
    component: CasePrinterComponent,
  },
  {
    path: 'trigger/:eid',
    resolve: {
      eventTrigger: EventTriggerResolver
    },
    component: CaseEventTriggerComponent,
    children: editorRouting,
    canActivate: [EventStartGuard],
    canDeactivate: [FileUploadProgressGuard]
  },
  {
    path: 'task-assignment',
    component: TaskAssignedComponent
  },
  {
    path: 'multiple-tasks-exist',
    component: MultipleTasksExistComponent
  },
  {
    path: 'no-tasks-available',
    component: NoTasksAvailableComponent
  },
  {
    path: 'task-cancelled',
    component: TaskCancelledComponent
  },
  {
    path: 'task-conflict',
    component: TaskConflictComponent
  },
  {
    path: 'event/:eid/history',
    component: CaseHistoryComponent,
  },
  {
    path: 'access-request',
    component: CaseChallengedAccessRequestComponent
  },
  {
    path: 'event/:eid/history',
    component: CaseHistoryComponent,
  },
  {
    path: 'challenged-access-request',
    children: [
      {
        path: '',
        component: CaseChallengedAccessRequestComponent,
        data: {
          title: 'Request Challenged Access'
        },
        pathMatch: 'full'
      },
      {
        path: 'success',
        component: CaseChallengedAccessSuccessComponent,
        data: {
          title: 'Challenged Access Success'
        }
      }
    ]
  },
  {
    path: 'specific-access-request',
    children: [
      {
        path: '',
        component: CaseSpecificAccessRequestComponent,
        data: {
          title: 'Request Specific Access'
        },
        pathMatch: 'full'
      }
    ]
  }
];
