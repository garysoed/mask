import { source } from 'grapevine';
import { fromPattern, LocationService } from 'persona';

import { $window } from '../../src/app/app';

export enum Views {
  // BREADCRUMB = 'b',
  BUTTON = 'bu',
  CHECKBOX = 'ch',
  CODE_BLOCK = 'cb',
  COLORS = 'co',
  // CROPPED_LINE = 'cl',
  // DIALOG = 'di',
  DRAWER_LAYOUT = 'dl',
  ICON = 'i',
  KEYBOARD = 'k',
  // ICON_WITH_TEXT = 'iwt',
  MAIN = 'ma',
  OVERLAY_LAYOUT = 'ol',
  RADIO_INPUT = 'ri',
  TEXT = 'tx',
  TEXT_INPUT = 'ti',
  // UPLOAD_BUTTON = 'ub',
}

const ROUTE_SPEC = {
  [Views.MAIN]: fromPattern('/', {}),
  [Views.BUTTON]: fromPattern('/button', {}),
  // [Views.BREADCRUMB]: fromPattern('/breadcrumb', {}),
  [Views.CHECKBOX]: fromPattern('/checkbox', {}),
  [Views.CODE_BLOCK]: fromPattern('/code-block', {}),
  [Views.COLORS]: fromPattern('/colors', {}),
  [Views.DRAWER_LAYOUT]: fromPattern('/drawer-layout', {}),
  [Views.ICON]: fromPattern('/icon', {}),
  [Views.KEYBOARD]: fromPattern('/keyboard', {}),
  [Views.OVERLAY_LAYOUT]: fromPattern('/overlay-layout', {}),
  [Views.RADIO_INPUT]: fromPattern('/radio-input', {}),
  [Views.TEXT]: fromPattern('/text', {}),
  [Views.TEXT_INPUT]: fromPattern('/text-input', {}),
  // [Views.CROPPED_LINE]: fromPattern('/cropped-line', {}),
  // [Views.DIALOG]: fromPattern('/dialog', {}),
  // [Views.UPLOAD_BUTTON]: fromPattern('/upload-button', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.MAIN};

export const $locationService = source(
    'LocationService',
    vine => new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
);
