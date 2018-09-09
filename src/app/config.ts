import { VineImpl } from 'grapevine/export/main';
import { CustomElementCtrl } from 'persona/export/main';

export interface Config {
  ctor: typeof CustomElementCtrl;
  dependencies?: Config[];
  configure?(vine: VineImpl): void;
}
