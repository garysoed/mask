import { $window, _v } from 'export';

import { LocationService, LocationSpec, Route, RouteSpec } from '@persona';
import { BehaviorSubject } from '@rxjs';


export enum Views {
  BREADCRUMB = 'b',
  CHECKBOX = 'ch',
  COLORS = 'co',
  ICON = 'i',
  MAIN = 'm',
}

export interface Routes extends LocationSpec {
  [Views.BREADCRUMB]: {};
  [Views.CHECKBOX]: {};
  [Views.COLORS]: {};
  [Views.ICON]: {};
  [Views.MAIN]: {};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/', type: Views.MAIN},
  {path: '/breadcrumb', type: Views.BREADCRUMB},
  {path: '/checkbox', type: Views.CHECKBOX},
  {path: '/colors', type: Views.COLORS},
  {path: '/icon', type: Views.ICON},
];

const DEFAULT_ROUTE: Route<Routes, Views.MAIN> = {payload: {}, type: Views.MAIN};

export const $locationService = _v.source(
    vine => new BehaviorSubject(
        new LocationService<Routes>(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
    ),
    globalThis,
);
