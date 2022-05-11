export enum LinkedCasesPages {
  BEFORE_YOU_START,
  LINK_CASE,
  UNLINK_CASE,
  CHECK_YOUR_ANSWERS
}

export enum LinkedCaseProposalEnum {
  CaseNumberError = 'Case numbers must have 16 digits',
  ReasonSelectionError = 'Select a reason why these cases should be linked',
  SomethingWrong = 'Something went wrong, please try again later',
  CaseCheckAgainError = 'Check the case number and try again',
}
