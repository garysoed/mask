import { VineImpl } from 'grapevine/export/main';
import { CustomElementCtrl } from 'persona/export/main';

export interface Config {
  ctor: typeof CustomElementCtrl;
  configure?(vine: VineImpl): void;
}
