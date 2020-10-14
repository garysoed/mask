import { cache } from 'gs-tools/export/data';
import { filterDefined } from 'gs-tools/export/rxjs';
import { StateId } from 'gs-tools/export/state';
import { elementWithTagType } from 'gs-types';
import { attributeOut, element, PersonaContext, stringParser } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Checkbox, CheckedValue } from '../../src/action/input/checkbox';
import { $simpleCheckbox } from '../../src/action/simple/simple-checkbox';
import { _p } from '../../src/app/app';
import { $stateService } from '../../src/core/state-service';
import { $drawerLayout, DrawerLayout, DrawerMode } from '../../src/layout/drawer-layout';
import { ThemedCustomElementCtrl } from '../../src/theme/themed-custom-element-ctrl';
import { DemoLayout } from '../base/demo-layout';
import { $demoState } from '../core/demo-state';
import { OverlayLayout } from '../../src/layout/overlay-layout';

import template from './overlay-layout.html';


export const $overlayLayoutDemo = {
  tag: 'mkd-overlay',
  api: {},
};

const $ = {
  drawer: element('drawer', $drawerLayout, {}),
  expandCheckbox: element('expandCheckbox', $simpleCheckbox, {}),
  rootPlay: element('rootPlay', elementWithTagType('section'), {
    layout: attributeOut('layout', stringParser()),
  }),
  horizontalModeCheckbox: element('horizontalModeCheckbox', $simpleCheckbox, {}),
};

@_p.customElement({
  ...$overlayLayoutDemo,
  dependencies: [
    Checkbox,
    DemoLayout,
    OverlayLayout,
  ],
  template,
})
export class OverlayLayoutDemo extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}
