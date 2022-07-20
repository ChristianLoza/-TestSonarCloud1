import { TestBed } from '@angular/core/testing';
import { LinkedCasesService } from '../../components/palette/case-link/services';
import { LovRefDataByServiceModel } from '../../services/common-data-service/common-data-service';
import { LinkCasesReasonValuePipe } from './ccd-link-cases-reason-code.pipe';

describe('LinkCasesReasonValuePipe', () => {

  let linkCasesReasonValuePipe: LinkCasesReasonValuePipe;
  const linkedCasesService = new LinkedCasesService();

  const linkCaseReasons: LovRefDataByServiceModel = {
    list_of_values: [
    {
      key: 'CLR001',
      value_en: 'Progressed as part of this lead case',
      value_cy: '',
      hint_text_en: 'Progressed as part of this lead case',
      hint_text_cy: '',
      lov_order: 1,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
    {
      key: 'CLR002',
      value_en: 'Bail',
      value_cy: '',
      hint_text_en: 'Bail',
      hint_text_cy: '',
      lov_order: 2,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
    {
      key: 'CLR003',
      value_en: 'Other',
      value_cy: '',
      hint_text_en: 'Other',
      hint_text_cy: '',
      lov_order: 3,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
  ]};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: LinkedCasesService, useValue: linkedCasesService}]
    });
    linkCasesReasonValuePipe = new LinkCasesReasonValuePipe(linkedCasesService);
    linkedCasesService.linkCaseReasons = linkCaseReasons.list_of_values;
  });

  it('should transform correct reason value when valid reason code is being passsed', () => {
    expect(linkCasesReasonValuePipe.transform('CLR002')).toBe('Bail');
  });

  it('should transform as undefined when invalid reason code is being passsed', () => {
    expect(linkCasesReasonValuePipe.transform('CLR005')).toBe(undefined);
  });

  it('should transform as undefined when no reason code is being passsed', () => {
    expect(linkCasesReasonValuePipe.transform('')).toBe(undefined);
  });
});