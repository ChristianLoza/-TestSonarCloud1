import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { _ as _score } from 'underscore';

export class ShowCondition {

  private static readonly AND_CONDITION_REGEXP = new RegExp('\\sAND\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static readonly OR_CONDITION_REGEXP = new RegExp('\\sOR\\s(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)', 'g');
  private static CONDITION_NOT_EQUALS = '!=';
  private static CONDITION_EQUALS = '=';
  private static readonly CONTAINS = 'CONTAINS';
  private static instanceCache = new Map<string, ShowCondition>();
  private static AND_CONDITION = 'AND';
  private static OR_CONDITION = 'OR';

  // private dumbCache = new Map<string, boolean>();
  private orConditions: string[] = null;
  private andConditions: string[] = null;
  

  static updatedAddPathPrefixToCondition(formula: any, pathPrefix): string {    
    if (!pathPrefix || pathPrefix === '') {
      if (formula === null) {
        return formula;
      } else {
        return JSON.stringify(formula);
      }
    }
    
    let finalCondition: string [] = [];    
    if (!!formula) {
      if (Array.isArray(formula)) {
        formula.forEach(condition => {
          if (!!condition && typeof condition === "object") {
            if (Array.isArray(condition)) {
              console.log('Condition1', condition);              
              finalCondition.push(JSON.parse(this.processAddPathPrefixToCondition(condition, pathPrefix)));
            } else {
              console.log('Condition2', condition);
              finalCondition.push(this.updatedExtractConditions(condition, pathPrefix));
            }
          } else {
            finalCondition.push(condition);
          }
        });
      } else {
        finalCondition.push(this.updatedExtractConditions(formula, pathPrefix));
      }
    }
    console.log('Final Result', JSON.stringify(finalCondition));
    return JSON.stringify(finalCondition);
  }

  private static updatedExtractConditions(condition, pathPrefix): string {
    if (!condition.fieldReference.startsWith(pathPrefix)) {
      condition.fieldReference= pathPrefix + '.' + condition.fieldReference;
      console.log('After Prefix', condition);
      return condition;
    } else {
      console.log('After Prefix', condition);
      return condition;
    }
  }

  private static processAddPathPrefixToCondition(formula: any, pathPrefix): string {
    let evaluatedCondition: string[] = [];
    console.log('processAddPathPrefixToCondition', formula);
    if (Array.isArray(formula)) {
      formula.forEach(condition => {
        if (!!condition && typeof condition === "object") {
          if (Array.isArray(condition)) {
            console.log('process Condition1', condition);
            evaluatedCondition.push(JSON.parse(this.processAddPathPrefixToCondition(condition, pathPrefix)));
          } else {
            console.log('process Condition2', condition);
            evaluatedCondition.push(this.updatedExtractConditions(condition, pathPrefix));
          }
        } else {
          evaluatedCondition.push(condition);
        }
      });
    } else {
      evaluatedCondition.push(this.updatedExtractConditions(formula, pathPrefix));
    }
    console.log('evalCondition', JSON.stringify(evaluatedCondition));
    return JSON.stringify(evaluatedCondition);
  }

  static addPathPrefixToCondition(showCondition: string, pathPrefix): string {
    if (!pathPrefix || pathPrefix === '') {
      return showCondition;
    }
    if (showCondition.search(ShowCondition.OR_CONDITION_REGEXP) !== -1) {
      let orConditions = showCondition.split(ShowCondition.OR_CONDITION_REGEXP);
      orConditions = this.extractConditions(orConditions, pathPrefix);
      return orConditions.join(' OR ');
    } else {
      let andConditions = showCondition.split(ShowCondition.AND_CONDITION_REGEXP);
      andConditions = this.extractConditions(andConditions, pathPrefix);
      return andConditions.join(' AND ');
    }
  }

  private static extractConditions(orConditions, pathPrefix) {    
    orConditions = orConditions.map(condition => {
      if (!condition.startsWith(pathPrefix)) {
        return pathPrefix + '.' + condition;
      } else {
        return condition;
      }
    });
    return orConditions;
  }

  // Cache instances so that we can cache results more effectively
  public static getInstance(cond: string): ShowCondition {
    const inst = this.instanceCache.get(cond);
    if (inst) {
      return inst;
    } else {
      const newInst = new ShowCondition(cond);
      this.instanceCache.set(cond, newInst);
      return newInst;
    }
  }

  // First evaluation: Process the condition for final processing or evaluate the condition if it has multi combination of AND/OR with in condition  
  public evaluateFormula(contextFields: any, formula: any, path?: string): boolean {
    let fields;
    if (Array.isArray(contextFields)) {
      fields = FieldsUtils.toValuesMap(contextFields);
    } else {
      fields = contextFields;
    }

    let comparator;
    let conditionsResult: boolean[] = [];
    
    if (!!formula) {
      if (Array.isArray(formula)) {
        formula.forEach(condition => {
          if (!!condition && typeof condition === "object") {
            if (comparator === ShowCondition.AND_CONDITION && conditionsResult.some(val => val === false)) {
              return false;
            } else if (comparator === ShowCondition.OR_CONDITION && conditionsResult.some(val => val)) {
              return true;
            }
            conditionsResult.push(this.processCondition(fields, condition, path));
          } else {
            comparator = condition;
          }
        });
      } else {
        conditionsResult.push(this.processCondition(fields, formula, path));
      }      
    }
    
    if (comparator === ShowCondition.AND_CONDITION) {        
      return conditionsResult.every(val => val);
    } else if (comparator === ShowCondition.OR_CONDITION) {        
      return conditionsResult.some(val => val);
    } else if (conditionsResult.length) {
      return conditionsResult[0];
    } else {
      return true;
    }
  }

  // Process the condition for final processing or evaluate the condition if it has multi combination of AND/OR with in condition
  private processCondition(fields: any, formula: any, path?: string): boolean {
    if (Array.isArray(formula)) {
      return this.evaluateFormulaArray(fields, formula, path);
    } else {
      return this.evaluateCondition(fields, formula, path);
    }    
  }

  // Process the condition for final processing or evaluate the condition if it has multi combination of AND/OR with in condition
  private evaluateFormulaArray(fields: any, formula: any, path?: string): boolean {    
    let comparator;
    let conditionsResult: boolean[] = [];
    formula.forEach(condition => {
      if (!!condition && typeof condition === "object") {
        if (comparator === ShowCondition.AND_CONDITION && conditionsResult.some(val => val === false)) {
          return false;
        } else if (comparator === ShowCondition.OR_CONDITION && conditionsResult.some(val => val)) {
          return true;
        }
        conditionsResult.push(this.processCondition(fields, condition, path));
      } else {
        comparator = condition;
      }
    });
    
    if (comparator === ShowCondition.AND_CONDITION) {      
      return conditionsResult.every(result => result);
    } else if (comparator === ShowCondition.OR_CONDITION) {      
      return conditionsResult.some(result => result);
    } else if (conditionsResult.length) {        
      return conditionsResult[0];
    } else {
      return false;
    }
  }

  //Final processing of evaluation of condition and return final result (True/False)
  private evaluateCondition(fields: any, condition: any, path?: string): boolean {
    //const value = isNaN(condition.value) || condition.value.toString().trim() === "" ? JSON.stringify(condition.value) : condition.value;
    const cond = condition.fieldReference + condition.comparator + condition.value;
    
    //console.log('Cond:',cond);
    //console.log('Result', this.matchEqualityCondition(fields, cond));
   
    return this.matchEqualityCondition(fields, cond, path);
  }

  // Expects a show condition of the form: <fieldName>="string"
  constructor(public condition: string) {
    /*if (!!condition) {
      if (condition.search(ShowCondition.OR_CONDITION_REGEXP) !== -1) {
        this.orConditions = condition.split(ShowCondition.OR_CONDITION_REGEXP);
      } else {
        this.andConditions = condition.split(ShowCondition.AND_CONDITION_REGEXP);
      }
    }*/
  }
  match(fields, path?: string): boolean {
    if (!this.condition) {
      return true;
    }
    return this.matchAndConditions(fields, this.condition, path);
  }
  private matchAndConditions(fields: any, condition: string, path?: string): boolean {
    if (!!this.orConditions)  {
      return this.orConditions.some(orCondition => this.matchEqualityCondition(fields, orCondition, path));
    } else if (!!this.andConditions) {
      return this.andConditions.every(andCondition => this.matchEqualityCondition(fields, andCondition, path));
    } else {
      return false;
    }
  }

  private matchEqualityCondition(fields: any, condition: string, path?: string): boolean {
    //console.log('matchEqualityCondition fields:',fields);
    if (condition.search(ShowCondition.CONTAINS) === -1) {
      let conditionSeparator = ShowCondition.CONDITION_EQUALS;
      if (condition.indexOf(ShowCondition.CONDITION_NOT_EQUALS) !== -1) {
        conditionSeparator = ShowCondition.CONDITION_NOT_EQUALS;
      }
      let field = condition.split(conditionSeparator)[0];
      const [head, ...tail] = field.split('.');
      let currentValue = this.findValueForComplexCondition(fields, head, tail, path);
      let expectedValue = this.unquoted(condition.split(conditionSeparator)[1]);
      console.log('Condition:',condition,this.checkValueEquals(expectedValue, currentValue, conditionSeparator));
      console.log('expectedValue',expectedValue);
      console.log('currentValue',currentValue);
      console.log('conditionSeparator',conditionSeparator);
      return this.checkValueEquals(expectedValue, currentValue, conditionSeparator);
    } else {
      let field = condition.split(ShowCondition.CONTAINS)[0];
      const [head, ...tail] = field.split('.');
      let currentValue = this.findValueForComplexCondition(fields, head, tail, path);
      let expectedValue = this.unquoted(condition.split(ShowCondition.CONTAINS)[1]);
      console.log('expectedValue',expectedValue);
      console.log('currentValue',currentValue);
      return this.checkValueContains(expectedValue, currentValue);
    }
  }

  private checkValueEquals(expectedValue, currentValue, conditionSeparaor): boolean {
    if (expectedValue.search('[,]') > -1) { // for  multi-select list
      return this.checkMultiSelectListEquals(expectedValue, currentValue, conditionSeparaor);
    } else if (expectedValue.endsWith('*') && currentValue && conditionSeparaor !== ShowCondition.CONDITION_NOT_EQUALS) {
      return currentValue.startsWith(this.removeStarChar(expectedValue));
    } else {
      // changed from '===' to '==' to cover number field conditions
      if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
        return this.checkValueNotEquals(expectedValue, currentValue);
      } else {
        return currentValue == expectedValue || this.okIfBothEmpty(expectedValue, currentValue); // tslint:disable-line
      }
    }
  }

  private checkValueNotEquals(expectedValue, currentValue) {
    let formatCurrentValue = currentValue ? currentValue.toString().trim() : '';
    if ('*' === expectedValue && formatCurrentValue !== '') {
      return false;
    }
    let formatExpectedValue = expectedValue ? expectedValue.toString().trim() : '';
    return formatCurrentValue != formatExpectedValue; // tslint:disable-line
  }

  private checkMultiSelectListEquals(expectedValue, currentValue, conditionSeparaor) {
    let expectedValues = expectedValue.split(',').sort().toString();
    let values = currentValue ? currentValue.sort().toString() : '';
    if (conditionSeparaor === ShowCondition.CONDITION_NOT_EQUALS) {
      return expectedValues !== values;
    } else {
      return expectedValues === values;
    }
  }

  private checkValueContains(expectedValue, currentValue): boolean {
    if (expectedValue.search(',') > -1) {
      let expectedValues = expectedValue.split(',').sort();
      let values = currentValue ? currentValue.sort().toString() : '';
      return expectedValues.every(item => values.search(item) >= 0);
    } else {
      let values = currentValue && Array.isArray(currentValue) ? currentValue.toString() : '';
      return values.search(expectedValue) >= 0;
    }
  }

  private findValueForComplexCondition(fields: any, head: string, tail: string[], path?: string) {
    //console.log('findValueForComplexCondition fields', fields);
    if (!fields) {
      return undefined;
    }
    console.log('head', head);
    console.log('tail', tail);
    if (tail.length === 0) {
      return this.getValue(fields, head);
    } else {
      if (FieldsUtils.isArray(fields[head])) {
        return this.findValueForComplexConditionInArray(fields, head, tail, path);
      } else {
        return this.findValueForComplexConditionForPathIfAny(fields, head, tail, path);
      }
    }
  }

  private findValueForComplexConditionForPathIfAny(fields: any, head: string, tail: string[], path?: string) {
    if (path) {
      const [_, ...pathTail] = path.split(/[_]+/g);
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), pathTail.join('_'));
    } else {
      return this.findValueForComplexCondition(fields[head], tail[0], tail.slice(1), path);
    }
  }

  private findValueForComplexConditionInArray(fields: any, head: string, tail: string[], path?: string) {
    // use the path to resolve which array element we refer to
    if (path.startsWith(head)) {
      const [_, ...pathTail] = path.split(/[_]+/g);
      if (pathTail.length > 0) {
        try {
          let arrayIndex = Number.parseInt(pathTail[0], 10);
          const [__, ...dropNumberPath] = pathTail;
          return (fields[head][arrayIndex] !== undefined) ? this.findValueForComplexCondition(
            fields[head][arrayIndex]['value'], tail[0], tail.slice(1), dropNumberPath.join('_')) : null;
        } catch (e) {
          console.log('Error while parsing number', pathTail[0], e);
        }
      }
    } else {
      console.log('Path in formArray should start with ', head, ', full path: ', path);
    }
  }

  private getValue(fields, head) {
    console.log('fields[head]', fields[head])
    if (this.isDynamicList(fields[head])) {
      return fields[head].value.code;
    } else {
      return fields[head];
    }
  }

  private isDynamicList(dynamiclist) {
    return !_score.isEmpty(dynamiclist) &&
      (_score.has(dynamiclist, 'value') && _score.has(dynamiclist, 'list_items'));
  }

  private unquoted(str) {
    return str.replace(/^"|"$/g, '');
  }

  private removeStarChar(s: string) {
    return s.substring(0, s.length - 1);
  }

  matchByContextFields(contextFields: CaseField[]): boolean {
    return this.match(FieldsUtils.toValuesMap(contextFields));
  }

  private okIfBothEmpty(right: string, value: any) {
    return value === null && (right === '');
  }

}
