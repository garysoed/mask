import {source} from 'grapevine';
import {Subject} from 'rxjs';

export interface OnRadioInput {
  readonly index: number;
  readonly group: string;
}

export const $onRadioInput$ = source<Subject<OnRadioInput>>(() => new Subject<OnRadioInput>());
