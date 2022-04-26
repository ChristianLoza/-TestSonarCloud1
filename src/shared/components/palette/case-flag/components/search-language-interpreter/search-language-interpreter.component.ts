import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ErrorMessage } from '../../../../../domain';
import { CaseFlagState, Language } from '../../domain';
import {
  CaseFlagFieldState,
  CaseFlagWizardStepTitle,
  SearchLanguageInterpreterErrorMessage,
  SearchLanguageInterpreterStep
} from '../../enums';

@Component({
  selector: 'ccd-search-language-interpreter',
  templateUrl: './search-language-interpreter.component.html',
  styleUrls: ['./search-language-interpreter.component.scss']
})
export class SearchLanguageInterpreterComponent implements OnInit {

  @Input()
  public formGroup: FormGroup;

  @Input()
  public languages: Language[];

  @Output()
  public caseFlagStateEmitter: EventEmitter<CaseFlagState> = new EventEmitter<CaseFlagState>();

  public readonly minSearchCharacters = 3;
  public readonly languageSearchTermControlName = 'languageSearchTerm';
  public readonly manualLanguageEntryControlName = 'manualLanguageEntry';
  public filteredLanguages$: Observable<Language[]>;
  public searchTerm = '';
  public isCheckboxEnabled = false;
  public errorMessages: ErrorMessage[] = [];
  public languageNotSelectedErrorMessage = '';
  public languageNotEnteredErrorMessage = '';
  public languageCharLimitErrorMessage = '';
  public noResults = false;
  private readonly languageMaxCharLimit = 80;

  public get caseFlagWizardStepTitle(): typeof CaseFlagWizardStepTitle {
    return CaseFlagWizardStepTitle;
  }

  public get searchLanguageInterpreterStep(): typeof SearchLanguageInterpreterStep {
    return SearchLanguageInterpreterStep;
  }

  public ngOnInit(): void {
    this.formGroup.addControl(this.languageSearchTermControlName, new FormControl());
    this.formGroup.addControl(this.manualLanguageEntryControlName, new FormControl());
    this.filteredLanguages$ = this.formGroup.get(this.languageSearchTermControlName).valueChanges.pipe(
      // Need to check type of input because it changes to object (i.e. Language) when a value is selected from the
      // autocomplete panel, instead of string when a value is being typed in
      map(input => typeof input === 'string' ? input : input.value),
      map(searchTerm => {
        // Update the current search term
        this.searchTerm = searchTerm;
        return this.filterLanguages(searchTerm);
      }),
      tap(languages => this.noResults = languages.length === 0)
    );
  }

  public onNext(): void {
    // Validate language interpreter entry
    this.validateLanguageEntry();
    // Return case flag field state, error messages, and "list of values" (i.e. languages) to the parent. The
    // "list of values" must be re-emitted because the parent component repopulates them from handling this
    // EventEmitter
    this.caseFlagStateEmitter.emit({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER,
      errorMessages: this.errorMessages,
      listOfValues: this.languages
    });
  }

  public onEnterLanguageManually(event: Event): void {
    this.isCheckboxEnabled = (event.target as HTMLInputElement).checked;
  }

  public displayLanguage(language?: Language): string | undefined {
    return language ? language.value : undefined;
  }

  private validateLanguageEntry(): void {
    this.languageNotSelectedErrorMessage = null;
    this.languageNotEnteredErrorMessage = null;
    this.languageCharLimitErrorMessage = null;
    this.errorMessages = [];
    // Checkbox not enabled means the user has opted to search for and select the language
    if (!this.isCheckboxEnabled && !this.formGroup.get(this.languageSearchTermControlName).value) {
      this.languageNotSelectedErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED;
      this.errorMessages.push({
        title: '',
        description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
        fieldId: this.languageSearchTermControlName
      });
    }
    // Checkbox enabled means the user has opted to enter the language manually
    if (this.isCheckboxEnabled) {
      if (!this.formGroup.get(this.manualLanguageEntryControlName).value) {
        this.languageNotEnteredErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED;
        this.errorMessages.push({
          title: '',
          description: SearchLanguageInterpreterErrorMessage.LANGUAGE_NOT_ENTERED,
          fieldId: this.manualLanguageEntryControlName
        });
      } else if (this.formGroup.get(this.manualLanguageEntryControlName).value.length > this.languageMaxCharLimit) {
        this.languageCharLimitErrorMessage = SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED;
        this.errorMessages.push({
          title: '',
          description: SearchLanguageInterpreterErrorMessage.LANGUAGE_CHAR_LIMIT_EXCEEDED,
          fieldId: this.manualLanguageEntryControlName
        });
      }
    }
  }

  private filterLanguages(searchTerm: string): Language[] {
    if (searchTerm.length < this.minSearchCharacters) {
      return [];
    }

    return this.languages
      ? this.languages.filter(language => language.value.toLowerCase().includes(searchTerm.toLowerCase(), 0))
      : [];
  }
}
