import { $window } from 'export';
import { source } from 'grapevine';
import { LocationService, LocationSpec, Route, RouteSpec } from 'persona';
import { BehaviorSubject } from 'rxjs';


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

export interface Routes extends LocationSpec {
  [Views.BREADCRUMB]: {};
  [Views.CHECKBOX]: {};
  [Views.COLORS]: {};
  [Views.CROPPED_LINE]: {};
  [Views.DIALOG]: {};
  [Views.DRAWER]: {};
  [Views.ICON]: {};
  [Views.ICON_WITH_TEXT]: {};
  [Views.MAIN]: {};
  [Views.TEXT_INPUT]: {};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/', type: Views.MAIN},
  {path: '/breadcrumb', type: Views.BREADCRUMB},
  {path: '/checkbox', type: Views.CHECKBOX},
  {path: '/colors', type: Views.COLORS},
  {path: '/cropped-line', type: Views.CROPPED_LINE},
  {path: '/dialog', type: Views.DIALOG},
  {path: '/drawer', type: Views.DRAWER},
  {path: '/icon', type: Views.ICON},
  {path: '/icon-with-text', type: Views.ICON_WITH_TEXT},
  {path: '/text-input', type: Views.TEXT_INPUT},
];

const DEFAULT_ROUTE: Route<Routes, Views.MAIN> = {payload: {}, type: Views.MAIN};

export const $locationService = source(
    vine => new BehaviorSubject(
        new LocationService<Routes>(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
    ),
    globalThis,
);
