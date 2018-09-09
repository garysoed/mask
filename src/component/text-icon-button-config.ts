import { Config } from '../app/config';
import { IconConfig } from '../display/icon-config';

export interface TextIconButtonConfig extends Config {
  dependencies: [IconConfig];
}
