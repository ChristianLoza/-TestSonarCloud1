import { LovRefDataByServiceModel } from '../../../../../services/common-data-service/common-data-service';
import { CaseLink } from '../../domain';

export const mockSearchByCaseIdsResponse = [
  {
    case_id: '1682374819203471',
    supplementary_data: {
      HMCTSServiceId: 'BBA3',
    },
    case_fields: {
      '[JURISDICTION]': 'SSCS',
      dwpDueDate: '2022-06-13',
      '[LAST_STATE_MODIFIED_DATE]': '2022-05-09T15:46:31.153',
      caseReference: '22',
      '[CREATED_DATE]': '2022-05-09T15:46:19.243',
      dateSentToDwp: '2022-05-09',
      '[CASE_REFERENCE]': '1652111179220086',
      '[STATE]': 'withDwp',
      '[ACCESS_GRANTED]': 'STANDARD',
      '[SECURITY_CLASSIFICATION]': 'PUBLIC',
      '[ACCESS_PROCESS]': 'NONE',
      '[CASE_TYPE]': 'Benefit_SCSS',
      'appeal.appellant.name.lastName': 'Torres',
      region: 'Quo nostrum vitae re',
      '[LAST_MODIFIED_DATE]': '2022-05-09T15:46:31.153',
    },
  },
]
export const mocklinkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
    },
  ];

export const mockCaseLinkResponse = [
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4961',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1682374819203471',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239aa',
            value: {
              Reason: 'CLRC013',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4962',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1682897456391875',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239b',
            value: {
              Reason: 'CLRC010',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4963',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1655736173180808',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239ac',
            value: {
              Reason: 'CLRC005',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4964',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1655965399602440',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239ad',
            value: {
              Reason: 'CLRC015',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4965',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1655965556867190',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239ae',
            value: {
              Reason: 'CLRC010',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
    {
      id: '52837798-42c6-43cc-98f6-0895fdba4966',
      value: {
        CaseType: 'FT_MasterCaseType',
        CaseReference: '1655965654097609',
        ReasonForLink: [
          {
            id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239ag',
            value: {
              Reason: 'CLRC015',
              OtherDescription: 'testing',
            },
          },
        ],
        CreatedDateTime: '2022-04-28T13:26:53.947877',
      },
    },
  ];

export const mockCaseLinkingReasonCode: LovRefDataByServiceModel = {
  list_of_values: [
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC001',
      value_en: 'Related appeal',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC002',
      value_en: 'Related proceedings',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC003',
      value_en: 'Same Party',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC004',
      value_en: 'Same child/ren',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC005',
      value_en: 'Familial',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC006',
      value_en: 'Guardian',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC013',
      value_en: 'Point of law',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC014',
      value_en: 'Other',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC015',
      value_en: 'Case consolidated',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC016',
      value_en: 'Progressed as part of this lead case',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC017',
      value_en: 'Linked for a hearing',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC007',
      value_en: 'Referred to the same judge',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC008',
      value_en: 'Shared evidence',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC009',
      value_en: 'Common circumstance',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC010',
      value_en: 'Bail',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC011',
      value_en: 'Findings of fact',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
    {
      category_key: 'CaseLinkingReasonCode',
      key: 'CLRC012',
      value_en: 'First Tier Agency (FTA) Request',
      value_cy: '',
      hint_text_en: '',
      hint_text_cy: '',
      lov_order: null,
      parent_category: '',
      parent_key: '',
      active_flag: 'Y',
      child_nodes: null,
    },
  ],
};
