import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-cancelled',
  templateUrl: './task-cancelled.component.html'
})
export class TaskCancelledComponent {
  @Input() public caseId = '1620409659381330';
}
