import { staticSourceId } from 'grapevine/export/component';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { InstanceofType } from 'gs-types/export';
import { _v } from '../app/app';

export interface SvgConfig {
  name: string;
  url: URL;
}

export const $registeredSvgs = staticSourceId(
    'display.registeredSvg',
    InstanceofType<ImmutableMap<string, SvgConfig>>(ImmutableMap));
_v.builder.source($registeredSvgs, ImmutableMap.of());
