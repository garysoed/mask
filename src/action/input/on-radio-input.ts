import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {Subject} from 'rxjs';

export interface OnRadioInput {
  readonly index: number;
  readonly stateId: StateId<number|null>;
}

export const $onRadioInput$ = source<Subject<OnRadioInput>>(
    'onRadioInput$',
    () => new Subject<OnRadioInput>(),
);
