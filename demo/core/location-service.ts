import { source } from 'grapevine';
import { fromPattern, LocationService } from 'persona';

import { $window } from '../../export';

export enum Views {
  // BREADCRUMB = 'b',
  // CHECKBOX = 'ch',
  // CODE_BLOCK = 'cb',
  COLORS = 'co',
  // CROPPED_LINE = 'cl',
  // DIALOG = 'di',
  // DRAWER = 'dr',
  // ICON = 'i',
  // ICON_WITH_TEXT = 'iwt',
  MAIN = 'ma',
  TEXT = 'tx',
  // TEXT_INPUT = 't',
  // UPLOAD_BUTTON = 'ub',
}

const ROUTE_SPEC = {
  [Views.MAIN]: fromPattern('/', {}),
  // [Views.BREADCRUMB]: fromPattern('/breadcrumb', {}),
  // [Views.CHECKBOX]: fromPattern('/checkbox', {}),
  // [Views.CODE_BLOCK]: fromPattern('/code-block', {}),
  [Views.COLORS]: fromPattern('/colors', {}),
  [Views.TEXT]: fromPattern('/text', {}),
  // [Views.CROPPED_LINE]: fromPattern('/cropped-line', {}),
  // [Views.DIALOG]: fromPattern('/dialog', {}),
  // [Views.DRAWER]: fromPattern('/drawer', {}),
  // [Views.ICON]: fromPattern('/icon', {}),
  // [Views.ICON_WITH_TEXT]: fromPattern('/icon-with-text', {}),
  // [Views.TEXT_INPUT]: fromPattern('/text-input', {}),
  // [Views.UPLOAD_BUTTON]: fromPattern('/upload-button', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.MAIN};

export const $locationService = source(
    'LocationService',
    vine => new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
);
