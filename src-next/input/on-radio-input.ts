import {source} from 'grapevine';
import {Subject} from 'rxjs';

export interface OnRadioInput {
  readonly key: string;
  readonly group: string;
}

export const $onRadioInput$ = source<Subject<OnRadioInput>>(() => new Subject<OnRadioInput>());
