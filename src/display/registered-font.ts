import { staticSourceId, StaticSourceId } from 'grapevine/export/component';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { InstanceofType, StringType } from 'gs-types/export';
import { _v } from '../app/app';

export interface FontConfig {
  iconClass: string;
  url: URL;
}

export const $defaultIconFont = staticSourceId('display.defaultIconFont', StringType);
_v.builder.source($defaultIconFont, '');

export const $registeredFonts = staticSourceId(
    'display.registeredFont',
    InstanceofType<ImmutableMap<string, FontConfig>>(ImmutableMap));
_v.builder.source($registeredFonts, ImmutableMap.of());
