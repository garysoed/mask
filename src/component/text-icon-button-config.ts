import { Config } from '../app/config';
import { IconWithTextConfig } from '../display/icon-with-text';

export interface TextIconButtonConfig extends Config {
  dependencies: [IconWithTextConfig];
}
