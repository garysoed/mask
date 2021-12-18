import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';

import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import {DrawerMode, DRAWER_LAYOUT} from './drawer-layout';
import goldens from './goldens/goldens.json';


test('@mask/src/layout/drawer-layout', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/layout/goldens', goldens));
    const tester = setupThemedTest({
      roots: [DRAWER_LAYOUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    const element = tester.createElement(DRAWER_LAYOUT);
    element.textContent = 'content';

    return {element, tester};
  });

  test('styleHeight$', () => {
    should('render the max size if horizontal and expanded', () => {
      _.element.setAttribute('mode', DrawerMode.HORIZONTAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(_.element).to.matchSnapshot('drawer-layout__horizontal_expanded.html');
    });

    should('render the min size if horizontal and collapsed', () => {
      _.element.setAttribute('mode', DrawerMode.HORIZONTAL);
      _.element.setAttribute('max-size', '123px');

      assert(_.element).to.matchSnapshot('drawer-layout__horizontal_collapsed.html');
    });

    should('render \'100%\' if vertical', () => {
      _.element.setAttribute('mode', DrawerMode.VERTICAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(_.element).to.matchSnapshot('drawer-layout__vertical_full.html');
    });
  });

  test('styleWidth$', () => {
    should('render the max size if vertical and expanded', () => {
      _.element.setAttribute('mode', DrawerMode.VERTICAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(_.element).to.matchSnapshot('drawer-layout__vertical_expanded.html');
    });

    should('render the min size if vertical and collapsed', () => {
      _.element.setAttribute('mode', DrawerMode.VERTICAL);
      _.element.setAttribute('max-size', '123px');

      assert(_.element).to.matchSnapshot('drawer-layout__vertical_collapsed.html');
    });

    should('render \'100%\' if horizontal', () => {
      _.element.setAttribute('mode', DrawerMode.HORIZONTAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(_.element).to.matchSnapshot('drawer-layout__horizontal_full.html');
    });
  });
});
