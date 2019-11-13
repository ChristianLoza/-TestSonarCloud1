import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { CollectionsHelpers } from './collections-helpers';
import { Injectable } from '@angular/core';

@Injectable()
export class FormGroupHelper {
  /**
   * This function is going to find a component's value by a component id. It will search the component's value
   * in the FormGroup container.
   * @param componentId this is the component id that is going to be used to find the component's value.
   * @param group this is the top level FormGroup container.
   * @return not-Defined if the component'value could not be found. componentValue:any
   * if there is a component's value is found.
   */
  findControlValueFromFromGroup(componentId: string, group: AbstractControl): any {
    let result = this.getControlValueFromTopLevelForm(componentId, group);
    if (result.length === 0) {
      return null;
    }
    return result[0];
  }
  private isAValidForm(group: AbstractControl): boolean {
    let formGroup: FormGroup = <FormGroup>  group;
    if (!formGroup) { return true; }
    return false;
  }

  private getControlValueFromTopLevelForm(componentId: string, group: AbstractControl): any {
    // This inner function filterNullElement is going to be used to clean all empty result coming from map executions.
    const filterNullElement = function (el) { return el != null; }
    let formGroup: FormGroup = <FormGroup>  group;
    let control;
    let collectionsHelpers = new CollectionsHelpers();
    // If the formGroup is empty it means that there is no any control.
    if (this.isAValidForm(group)) { return Array(); }
    // map through the FormGroup controls.
    let formControls = Object.keys(formGroup.controls).map((key: string) => {
      // Get a reference to the control using the FormGroup.get() method
      const abstractControl = group.get(key);
      // If the control is an instance of FormGroup i.e a nested FormGroup
      // then recursively call this same method (logKeyValuePairs) passing it
      if (abstractControl instanceof FormGroup) {
        return this.getControlValueFromTopLevelForm(componentId, abstractControl);
        // If the control is not a FormGroup then we know it's a FormControl or a FormArray
      } else {
        if (abstractControl instanceof  FormArray) {
          // map through the FormArray controls.
          return abstractControl.controls.map((formControl) => {
            return this.getControlValueFromTopLevelForm(componentId, formControl)
          }).filter(filterNullElement);
          // If the control is not a FormGroup then we know it's a FormControl
        } else {
          if (key === componentId) {
            return abstractControl.value;
          }
        }
      }
      return control;
    }).filter(filterNullElement);
    const flattenedArray = collectionsHelpers.flatAnArray(formControls);
    return collectionsHelpers.flatAnArray(Array.from(new Set(flattenedArray).values()));
  }

}
