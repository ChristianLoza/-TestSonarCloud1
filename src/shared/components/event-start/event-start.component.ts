import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkPortalOutlet, ComponentPortal, Portal, TemplatePortal } from '@angular/cdk/portal';
import { State, StateMachine } from '@edium/fsm';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'ccd-event-start',
  templateUrl: './event-start.component.html',
  styleUrls: ['./event-start.component.scss']
})
export class EventStartComponent implements OnInit, AfterViewInit {
  @Input() public event: string;
  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<any>;
  @ViewChild('portal') portal: CdkPortalOutlet;
  public selectedPortal: Portal<any>;
  public componentPortal1: ComponentPortal<ComponentPortalExample1Component>;
  public componentPortal2: ComponentPortal<ComponentPortalExample2Component>;
  public templatePortal: TemplatePortal<any>;
  private stateMachine: StateMachine;
  private s1: State;
  private s2: State;
  private s3: State;

  private firstAction = (state: State, context ) => {
    const componentRef = this.portal.attach<ComponentPortalExample1Component>(new ComponentPortal(ComponentPortalExample1Component));
    componentRef.instance.isNextClick$.subscribe(event => {
      if (event) {
        this.stateMachine.currentState.trigger('next');
      }
    });
  };
  private secondAction = (state: State, context ) => {
    this.portal.detach();
    const componentRef = this.portal.attach<ComponentPortalExample2Component>(new ComponentPortal(ComponentPortalExample2Component));
    componentRef.instance.isNextClick1$.subscribe(event => {
      if (event) {
        this.stateMachine.currentState.trigger('next');
      }
    });
  };
  private lastAction = (state: State, context ) => {
    const navigationExtras = {queryParams: {isComplete: true}};
    this.router.navigate(['/cases/case-details/1546883526751282/trigger/sendDirection/sendDirectionsendDirection'], navigationExtras);
    return true;
  }
  constructor(private _viewContainerRef: ViewContainerRef,
              private router: Router) {}

  public ngOnInit() {
    const context = {
      task$: of([{}]),
      cases$: of([]),
    };
    this.stateMachine = new StateMachine('My first state machine', context);
    this.s1 = this.stateMachine.createState('My first', false, this.firstAction);
    this.s2 = this.stateMachine.createState('My second', false, this.secondAction);
    this.s3 = this.stateMachine.createState('Final State', true, this.lastAction);
    this.s1.addTransition('next', this.s2);
    this.s2.addTransition('next', this.s3);
  }

  ngAfterViewInit() {
    this.templatePortal = new TemplatePortal(this.templatePortalContent, this._viewContainerRef);
  }

  public onNextClick() {
    if (!this.stateMachine.started) {
      console.log('state machine started');
      this.stateMachine.start(this.s1);
    }
  }
}

@Component({
  selector: 'component-portal-example1',
  template: '<button (click)="onNextClick()">Go to state 2</button>'
})
export class ComponentPortalExample1Component {
  public isNextClick$ = new BehaviorSubject<boolean>(false);
  public onNextClick() {
    console.log('onNextClick');
    this.isNextClick$.next(true);
  }
}

@Component({
  selector: 'component-portal-example2',
  template: '<button (click)="onNextClick()">Go to end State</button>'
})
export class ComponentPortalExample2Component {
  public isNextClick1$ = new BehaviorSubject<boolean>(false);
  public onNextClick() {
    console.log('onNextClick');
    this.isNextClick1$.next(true);
  }
}
