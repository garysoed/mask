import { staticSourceId, StaticSourceId } from 'grapevine/export/component';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { InstanceofType, StringType } from 'gs-types/export';
import { vine_ } from '../app/app';

export interface FontConfig {
  iconClass: string;
  url: URL;
}

export const $defaultIconFont = staticSourceId('display.defaultIconFont', StringType);
vine_.builder.source($defaultIconFont, '');

export const $registeredFonts = staticSourceId(
    'display.registeredFont',
    InstanceofType<ImmutableMap<string, FontConfig>>(ImmutableMap));
vine_.builder.source($registeredFonts, ImmutableMap.of());
