import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { plainToClass } from 'class-transformer';
import { Headers } from '@angular/http';
import { HttpService, HttpErrorService } from '../../../services';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseHistory } from '../domain';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class CaseHistoryService {
  public static readonly V2_MEDIATYPE_CASE_EVENT_VIEW =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-event-view.v2+json;charset=UTF-8';

  constructor(private httpService: HttpService,
    private httpErrorService: HttpErrorService,
    private appConfig: AbstractAppConfig) { }

  get(caseId: string,
    eventId: string): Observable<CaseHistory> {

    const url = this.appConfig.getCaseHistoryUrl(caseId, eventId);

    let headers = new Headers({
      'experimental': 'true',
      'Accept': CaseHistoryService.V2_MEDIATYPE_CASE_EVENT_VIEW
    });

    return this.httpService
      .get(url, { headers }).pipe(map(response => response.json()), catchError((error: any): any => {
        this.httpErrorService.setError(error);
        return throwError(error);
      }), map((caseHistory: Object) => plainToClass(CaseHistory, caseHistory)));
  }
}
