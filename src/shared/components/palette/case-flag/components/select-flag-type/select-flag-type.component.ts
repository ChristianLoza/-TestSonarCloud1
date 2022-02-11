import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CaseFlagFieldState } from '../..';
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

  public flagTypes: FlagType[];
  public flagTypeSelected: string;
  public errorMessages: ErrorMessage[];
  public flagTypeNotSelectedErrorMessage = '';
  public flagTypeErrorMessage = '';
  
  public ngOnInit(): void {
    this.flagTypes = this.getFlagTypes();
    this.flagTypes.forEach(flagType => {
      this.formGroup.addControl(flagType.id, new FormControl(''));
    });
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
  }

  private validateForm(): boolean {
    this.flagTypeNotSelectedErrorMessage = '';
    this.flagTypeErrorMessage = '';
    this.errorMessages = [];

    if (!this.flagTypeSelected) {
      this.flagTypeNotSelectedErrorMessage = 'Please select a flag type'
      this.errorMessages.push({title: '', description: `${this.flagTypeNotSelectedErrorMessage}`, fieldId: 'conditional-radios-list'})
      return false;
    }
    if (this.flagTypeSelected === 'other') {
      const otherFlagTypeDescription = this.formGroup.get('otherFlagTypeDescription').value;
      if (!otherFlagTypeDescription) {
        this.flagTypeErrorMessage = 'Please enter a flag type';
        this.errorMessages.push({title: '', description: `${this.flagTypeErrorMessage}`, fieldId: 'other-flag-type-description'});
        return false;
      }
      if (otherFlagTypeDescription.length > 80) {
        this.flagTypeErrorMessage = 'You can enter up to 80 characters only';
        this.errorMessages.push({title: '', description: `${this.flagTypeErrorMessage}`, fieldId: 'other-flag-type-description'});
        return false;
      }
    }

    return true;
  }

  private getFlagTypes(): FlagType[] {
    // TODO: Get the list of flag types using the API call in future sprints
    return [
      {id: 'urgent-case', name: 'Urgent case'},
      {id: 'vulnerable-user', name: 'Vulnerable user'}
    ];
  }
}
