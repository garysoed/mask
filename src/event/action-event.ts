export const ACTION_EVENT = 'mk-action';

export class ActionEvent<P> extends Event {
  /**
   * @param key Key identifying the target.
   */
  constructor(readonly payload: P) {
    super(ACTION_EVENT, {bubbles: true});
  }
}
