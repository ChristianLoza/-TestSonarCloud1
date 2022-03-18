import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagTypeErrorMessage } from '../../enums';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, FlagType } from '../../domain';

@Component({
  selector: 'ccd-select-flag-type',
  templateUrl: './select-flag-type.component.html',
  styleUrls: ['./select-flag-type.component.scss']
})
export class SelectFlagTypeComponent implements OnInit {

  @Input()
  public formGroup: FormGroup;

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  @Output()
  public flagCommentsOptionalEmitter: EventEmitter<any> = new EventEmitter();

  public flagTypes: FlagType[];
  public flagTypeSelected: string;
  public errorMessages: ErrorMessage[];
  public flagTypeNotSelectedErrorMessage = '';
  public flagTypeErrorMessage = '';

  private readonly maxCharactersForOtherFlagType = 80;

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle
  }

  public ngOnInit(): void {
    this.flagTypes = this.getFlagTypes();
    this.formGroup.addControl('flagType', new FormControl(''));
    this.formGroup.addControl('other', new FormControl(''));
    this.formGroup.addControl('otherFlagTypeDescription', new FormControl(''));
  }

  public onFlagTypeChanged(flagTypeId: string): void {
    // Display description textbox if 'other' checkbox is selected
    this.flagTypeSelected = flagTypeId;
  }

  public onNext(): void {
    // Validate form
    this.validateForm();
    // Return case flag field state and error messages to the parent
    this.caseFlagStateEmitter.emit({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: this.errorMessages });
    // Emit "flag comments optional" event if the user selects a flag type where comments are optional
    // TODO Change for real implementation once integrated with Reference Data API
    if (this.flagTypeSelected === 'flag-with-optional-comments') {
      this.flagCommentsOptionalEmitter.emit(null);
    }
  }

  private validateForm(): void {
    this.flagTypeNotSelectedErrorMessage = '';
    this.flagTypeErrorMessage = '';
    this.errorMessages = [];

    if (!this.flagTypeSelected) {
      this.flagTypeNotSelectedErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED;
      this.errorMessages.push({title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED}`, fieldId: 'conditional-radios-list'})
    }
    if (this.flagTypeSelected === 'other') {
      const otherFlagTypeDescription = this.formGroup.get('otherFlagTypeDescription').value;
      if (!otherFlagTypeDescription) {
        this.flagTypeErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED;
        this.errorMessages.push({title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED}`, fieldId: 'other-flag-type-description'});
      }
      if (otherFlagTypeDescription.length > this.maxCharactersForOtherFlagType) {
        this.flagTypeErrorMessage = SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED;
        this.errorMessages.push({title: '', description: `${SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED}`, fieldId: 'other-flag-type-description'});
      }
    }
  }

  private getFlagTypes(): FlagType[] {
    // TODO: Get the list of flag types using the API call in future sprints
    return [
      {id: 'urgent-case', name: 'Urgent case'},
      {id: 'vulnerable-user', name: 'Vulnerable user'},
      {id: 'flag-with-optional-comments', name: 'Flag where comments are optional'}
    ];
  }
}
