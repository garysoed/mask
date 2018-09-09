import { VineImpl } from 'grapevine/export/main';
import { Config } from '../app/config';

export interface IconConfig extends Config {
  configure(vine: VineImpl): void;
}
