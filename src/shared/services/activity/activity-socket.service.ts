import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Socket } from 'socket.io-client';

import { CaseActivityInfo } from '../../domain/activity';
import { SessionStorageService } from '../session/session-storage.service';
import { ActivityService } from './activity.service';
import { SetCaseActivity, WatchCases } from './models';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root'
})
export class ActivitySocketService {
  public static SOCKET_MODES: string[] = [ Utils.MODES.socket, Utils.MODES.socketLongPoll ];

  public activity: Observable<CaseActivityInfo[]>;
  public connect: Observable<any>;
  public disconnect: Observable<any>;
  public connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public socket: Socket;
  private pUser: object;
  public get user(): object {
    return this.pUser || this.setupUser();
  }

  public get isEnabled(): boolean {
    return this.activityService.isEnabled && !!this.socket;
  }

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly activityService: ActivityService
  ) {
    this.activityService.modeSubject
      .pipe(filter(mode => !!mode))
      .pipe(distinctUntilChanged())
      .subscribe(mode => {
        this.destroy();
        if (ActivitySocketService.SOCKET_MODES.indexOf(mode) > -1) {
          this.init();
        }
      });
  }

  public watchCases(caseIds: string[]): void {
    const payload: WatchCases = { caseIds };
    this.socket.emit('watch', payload);
  }

  public viewCase(caseId: string): void {
    const payload: SetCaseActivity = { caseId };
    this.socket.emit('view', payload);
  }

  public editCase(caseId: string): void {
    const payload: SetCaseActivity = { caseId };
    this.socket.emit('edit', payload);
  }

  private init(): void {
    this.socket = Utils.getSocket(this.user, this.activityService.mode === Utils.MODES.socket);
    this.connect = this.getObservableOnSocketEvent<any>('connect');
    this.disconnect = this.getObservableOnSocketEvent<any>('disconnect');
    this.activity = this.getObservableOnSocketEvent<CaseActivityInfo[]>('activity');

    this.disconnect.subscribe(() => {
      this.connected.next(false);
    });
    this.connect.subscribe(() => {
      this.connected.next(true);
    });

    this.socket.connect();
  }

  private destroy(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = undefined;
    }
  }

  private getObservableOnSocketEvent<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socket.on(event, (payload: T) => {
        observer.next(payload);
      });
    });
  }

  private setupUser(): object {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    const user = userInfoStr ? JSON.parse(userInfoStr) : null;
    if (user) {
      delete user.token;
    }
    this.pUser = user;
    return this.pUser;
  }
}
