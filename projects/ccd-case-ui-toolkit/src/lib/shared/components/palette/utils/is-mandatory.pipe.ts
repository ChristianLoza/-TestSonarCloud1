import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';

@Pipe({
  name: 'ccdIsMandatory'
})
export class IsMandatoryPipe implements PipeTransform {

  constructor(private readonly  caseFieldService: CaseFieldService) {}

  public transform(field: CaseField): boolean {
    return this.caseFieldService.isMandatory(field);
  }
}
