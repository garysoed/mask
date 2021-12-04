export const CHANGE_EVENT = 'mk-change';

export class ChangeEvent<T> extends Event {
  constructor(readonly oldValue: T) {
    super(CHANGE_EVENT, {bubbles: true});
  }
}
