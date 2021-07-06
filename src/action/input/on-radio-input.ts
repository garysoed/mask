import {source} from 'grapevine';
import {ObjectPath} from 'gs-tools/export/state';
import {Subject} from 'rxjs';

export interface OnRadioInput {
  readonly index: number;
  readonly stateId: ObjectPath<number|null>;
}

export const $onRadioInput$ = source<Subject<OnRadioInput>>(() => new Subject<OnRadioInput>());
