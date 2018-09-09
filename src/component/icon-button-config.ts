import { Config } from '../app/config';
import { IconConfig } from '../display/icon-config';

export interface IconButtonConfig extends Config {
  dependencies: [IconConfig];
}
