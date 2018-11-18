import { VineImpl } from 'grapevine/export/main';
import { CustomElementCtrl } from 'persona/export/main';

export interface Config {
  /** TODO: Delete ctrl */
  ctor?: typeof CustomElementCtrl;
  dependencies?: Config[];
  tag: string;
  configure?(vine: VineImpl): void;
}
