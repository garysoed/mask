import { $window } from 'export';
import { source } from 'grapevine';
import { fromPattern, LocationService } from 'persona';

export enum Views {
  BREADCRUMB = 'b',
  CHECKBOX = 'ch',
  COLORS = 'co',
  CROPPED_LINE = 'cl',
  DIALOG = 'di',
  DRAWER = 'dr',
  ICON = 'i',
  ICON_WITH_TEXT = 'iwt',
  MAIN = 'm',
  TEXT_INPUT = 't',
}

const ROUTE_SPEC = {
  [Views.MAIN]: fromPattern('/', {}),
  [Views.BREADCRUMB]: fromPattern('/breadcrumb', {}),
  [Views.CHECKBOX]: fromPattern('/checkbox', {}),
  [Views.COLORS]: fromPattern('/colors', {}),
  [Views.CROPPED_LINE]: fromPattern('/cropped-line', {}),
  [Views.DIALOG]: fromPattern('/dialog', {}),
  [Views.DRAWER]: fromPattern('/drawer', {}),
  [Views.ICON]: fromPattern('/icon', {}),
  [Views.ICON_WITH_TEXT]: fromPattern('/icon-with-text', {}),
  [Views.TEXT_INPUT]: fromPattern('/text-input', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.MAIN};

export const $locationService = source(
    vine => new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
);
