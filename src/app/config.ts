import { CustomElementCtrl } from 'persona/export/main';

export interface Config {
  ctor: typeof CustomElementCtrl;
  configure?(): void;
}
