import { staticSourceId } from 'grapevine/export/component';
import { createImmutableMap, ImmutableMap } from 'gs-tools/export/collect';
import { AnyType } from 'gs-types/export';
import { _v } from '../app/app';

export interface SvgConfig {
  name: string;
  url: URL;
}

export const $registeredSvgs = staticSourceId(
    'display.registeredSvg',
    AnyType<ImmutableMap<string, SvgConfig>>(),
);
_v.builder.source($registeredSvgs, createImmutableMap());
