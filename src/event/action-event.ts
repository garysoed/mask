export const ACTION_EVENT = 'mk-action';

export class ActionEvent extends Event {
  /**
   * @param key Key identifying the target.
   */
  constructor() {
    super(ACTION_EVENT, {bubbles: true});
  }
}
