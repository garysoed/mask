import { VineImpl } from '@grapevine/main';
import { CustomElementCtrl } from '@persona/main';

export interface Config {
  /** TODO: Delete ctrl */
  ctor?: typeof CustomElementCtrl;
  dependencies?: Config[];
  tag: string;
  configure?(vine: VineImpl): void;
}
