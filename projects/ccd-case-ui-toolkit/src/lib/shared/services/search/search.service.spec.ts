import { HttpHeaders, HttpParams } from '@angular/common/http';
import { waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { SearchInput } from '../../components/search-filters';
import { FieldType } from '../../domain/definition/field-type.model';
import { Field } from '../../domain/search/field.model';
import { HttpService, OptionsType } from '../http/http.service';
import { LoadingService } from '../loading/loading.service';
import { RequestOptionsBuilder } from '../request/request.options.builder';
import { SearchService } from './search.service';
import createSpyObj = jasmine.createSpyObj;

describe('SearchService', () => {

  const JID = 'TEST';
  const CTID = 'TestAddressBookCase';
  const API_URL = 'http://aggregated.ccd.reform';
  const DATA_URL = 'http://data.ccd.reform';
  const SEARCH_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases`;
  const VIEW = `WORKBASKET`;
  const SEARCH_CASES_URL = DATA_URL + `/internal/searchCases?ctid=${CTID}&use_case=${VIEW}`;
  const SEARCH_INPUT_URL = DATA_URL + '/internal/case-types/0/search-inputs';

  const SEARCH_VIEW = {
    columns: [],
    results: [],
    hasDrafts: () => false
  };

  const TEST_FIELD_TYPE_NAME = 'Text';
  const TEST_FIELD_TYPE: FieldType = {
    id: TEST_FIELD_TYPE_NAME,
    type: TEST_FIELD_TYPE_NAME
  };
  const TEST_CASE_TYPE_ID = '0';
  const TEST_JURISTICTION_ID = '0';
  const SEARCH_INPUT_LABEL = 'test-label';
  const SEARCH_INPUT_ORDER = 10;
  const TEST_FIELD_ID = 'PersonFirstName';
  const TEST_FIELD: Field = new Field(TEST_FIELD_ID, TEST_FIELD_TYPE);
  const SEARCH_INPUT: SearchInput = new SearchInput(SEARCH_INPUT_LABEL, SEARCH_INPUT_ORDER, TEST_FIELD);
  const SEARCH_INPUTS = { searchInputs: [SEARCH_INPUT]};

  let params: HttpParams;
  let appConfig: any;
  let httpService: any;
  let searchService: SearchService;
  let requestOptionsArgs: OptionsType;
  let requestOptionsBuilder: any;
  let loadingService: any;

  describe('get()', () => {

    beforeEach(() => {
      function matchCall(value: any, expected: any): boolean {
        return expected === value ||
            JSON.stringify(expected) === JSON.stringify(value) ||
            expected[0] === value[0] && JSON.stringify(expected[1]).trim() === JSON.stringify(value[1]).trim();
      }

      jasmine.addCustomEqualityTester(matchCall);

      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(DATA_URL);

      httpService = createSpyObj<HttpService>('httpService', ['get']);
      httpService.get.and.returnValue(of({}));

      params = new HttpParams();
      requestOptionsArgs = { params, observe: 'body' };

      requestOptionsBuilder = createSpyObj<RequestOptionsBuilder>('requestOptionsBuilder', ['buildOptions']);
      requestOptionsBuilder.buildOptions.and.returnValue(requestOptionsArgs);

      loadingService = createSpyObj<LoadingService>('loadingService', ['register', 'unregister']);

      searchService = new SearchService(appConfig, httpService, requestOptionsBuilder, loadingService);
    });

    it('should call httpService with right URL, authorization, meta and case criteria and http method for search', waitForAsync(() => {
      searchService
        .search(JID, CTID, {}, {})
        .subscribe()
        .add(() => {
          expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params, observe: 'body'});
        });
    }));

    it('should call requestOptionsBuilder with right meta, case criteria and no view arguments', waitForAsync(() => {
      const metaCriteria = { caseState: 'testState'};
      const caseCriteria = { firstName: 'testFirstName', lastName: 'testLastName'};

      searchService
        .search(JID, CTID, metaCriteria, caseCriteria)
        .subscribe()
        .add(() => {
          expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria);
        });
    }));

    it('should set `view` param if required', waitForAsync(() => {
      searchService
        .search(JID, CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          params.set('view', SearchService.VIEW_WORKBASKET);
          expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params, observe: 'body'});
        });
    }));

    it('should call requestOptionsBuilder with right meta, case criteria and view arguments', waitForAsync(() => {
      const metaCriteria = { caseState: 'testState'};
      const caseCriteria = { firstName: 'testFirstName', lastName: 'testLastName'};
      searchService
        .search(JID, CTID, metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET);
        });
    }));

    // FIXME
    xit('should set criteria params if passed', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should set criteria params with case field data when passed', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {name: 'value'})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      params.set('case.name', 'value');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should set criteria params with case field data when passed with spaces stripped', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {name: ' value '})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      params.set('case.name', 'value');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should not set criteria params with case field data when passed as empty', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {name: ''})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should not set criteria params with case field data when passed with spaces', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {name: '   '})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should return search results', () => {
      searchService
        .search(JID, CTID, {}, {})
        .subscribe(resultView => {
          expect(resultView).toEqual(SEARCH_VIEW);
        });
    });

    it('should call backend with right URL, authorization and method for search input', waitForAsync(() => {
      httpService.get.and.returnValue(of(SEARCH_INPUTS));

      searchService
        .getSearchInputs(TEST_JURISTICTION_ID, TEST_CASE_TYPE_ID)
        .subscribe()
        .add(() => {
          expect(httpService.get).toHaveBeenCalledWith(SEARCH_INPUT_URL, {
            headers: new HttpHeaders()
              .set('experimental', 'true')
              .set('Accept', SearchService.V2_MEDIATYPE_SEARCH_INPUTS)
              .set('Content-Type', 'application/json'),
            observe: 'body'
          });
        });
    }));

    it('should return search input results', waitForAsync(() => {
      httpService.get.and.returnValue(of(SEARCH_INPUTS));

      searchService
        .getSearchInputs(TEST_JURISTICTION_ID, TEST_CASE_TYPE_ID)
        .subscribe(resultInputModel => {
          expect(resultInputModel[0].field.id).toEqual(SEARCH_INPUTS.searchInputs[0].field.id);
        });
    }));

    it('should register loading token when called', waitForAsync(() => {
      searchService
      .search(JID, CTID, {}, {})
        .subscribe()
        .add(() => {
          expect(loadingService.register).toHaveBeenCalled();
        });
    }));

    it('should unregister loading token when finished', waitForAsync(() => {
      searchService
        .search(JID, CTID, {}, {})
        .subscribe()
        .add(() => {
          expect(loadingService.unregister).toHaveBeenCalled()
        });
    }));

  });

  describe('post()', () => {

    beforeEach(waitForAsync(() => {
      function matchCall(value: any, expected: any): boolean {
        return expected === value ||
            JSON.stringify(expected) === JSON.stringify(value) ||
            expected[0] === value[0] && JSON.stringify(expected[1]).trim() === JSON.stringify(value[1]).trim();
      }

      jasmine.addCustomEqualityTester(matchCall);

      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getPaginationPageSize']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(DATA_URL);
      appConfig.getPaginationPageSize.and.returnValue(25);

      httpService = createSpyObj<HttpService>('httpService', ['post']);
      httpService.post.and.returnValue(of({}));

      params = new HttpParams();
      requestOptionsArgs = { params, observe: 'body' };

      requestOptionsBuilder = createSpyObj<RequestOptionsBuilder>('requestOptionsBuilder', ['buildOptions']);
      requestOptionsBuilder.buildOptions.and.returnValue(requestOptionsArgs);

      loadingService = createSpyObj<LoadingService>('loadingService', ['register', 'unregister']);

      searchService = new SearchService(appConfig, httpService, requestOptionsBuilder, loadingService);
    }));

    it('should call httpService with right URL, authorization, meta and case criteria and http method for search', waitForAsync(() => {
      searchService
        .searchCases(CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          expect(httpService.post).toHaveBeenCalledWith(SEARCH_CASES_URL, { sort: undefined, size: 25 }, {params, observe: 'body'});
        });
    }));

    it('should call requestOptionsBuilder with right meta, case criteria and no view arguments', waitForAsync(() => {
      const metaCriteria = { caseState: 'testState'};
      const caseCriteria = { firstName: 'testFirstName', lastName: 'testLastName'};

      searchService
        .searchCases(CTID, metaCriteria, caseCriteria)
        .subscribe(() => {
          expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria);
        });
    }));

    it('should set `view` param if required', waitForAsync(() => {
      searchService
        .searchCases(CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          params.set('view', SearchService.VIEW_WORKBASKET);
          expect(httpService.post).toHaveBeenCalledWith(SEARCH_CASES_URL, { sort: undefined, size: 25 }, {params, observe: 'body'});
        });
    }));

    it('should call requestOptionsBuilder with right meta, case criteria and view arguments', waitForAsync(() => {
      const metaCriteria = { caseState: 'testState'};
      const caseCriteria = { firstName: 'testFirstName', lastName: 'testLastName'};
      searchService
        .searchCases(CTID, metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET);
        });
    }));

    it('should call requestOptionsBuilder with right meta, case criteria and view arguments', waitForAsync(() => {
      const metaCriteria = { page: 1 };
      const caseCriteria = { preferredDQPilotCourt: 'Sunderland County, Family, Magistrates’ and Tribunal Hearings' };
      searchService
        .searchCases(CTID, metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET);
        });
    }));

    it('should register loading token when called', waitForAsync(() => {
      searchService
        .searchCases(CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          expect(loadingService.register).toHaveBeenCalled();
        });
    }));

    it('should unregister loading token when finished', waitForAsync(() => {
      searchService
        .searchCases(CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe()
        .add(() => {
          expect(loadingService.unregister).toHaveBeenCalled()
        });
    }));
  });
});
