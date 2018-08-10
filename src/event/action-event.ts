export class ActionEvent extends CustomEvent<null> {
  constructor() {
    super('mk-action');
  }
}
