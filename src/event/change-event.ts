export const CHANGE_EVENT = 'mk-change';

export class ChangeEvent extends Event {
  constructor(readonly value: string) {
    super(CHANGE_EVENT, {bubbles: true});
  }
}
