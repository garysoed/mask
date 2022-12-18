import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';

import {setupThemedTest} from '../testing/setup-themed-test';

import {DrawerMode, DRAWER_LAYOUT} from './drawer-layout';
import goldens from './goldens/goldens.json';


test('@mask/src/layout/drawer-layout', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/layout/goldens', goldens));
    const tester = setupThemedTest({
      roots: [DRAWER_LAYOUT],
    });
    const element = tester.bootstrapElement(DRAWER_LAYOUT);
    element.textContent = 'content';

    return {element, tester};
  });

  test('styleHeight$', () => {
    should('render the max size if horizontal and expanded', () => {
      _.element.setAttribute('mode', DrawerMode.HORIZONTAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(snapshotElement(_.element)).to.match('drawer-layout__horizontal_expanded.golden');
    });

    should('render the min size if horizontal and collapsed', () => {
      _.element.setAttribute('mode', DrawerMode.HORIZONTAL);
      _.element.setAttribute('max-size', '123px');

      assert(snapshotElement(_.element)).to.match('drawer-layout__horizontal_collapsed.golden');
    });

    should('render \'100%\' if vertical', () => {
      _.element.setAttribute('mode', DrawerMode.VERTICAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(snapshotElement(_.element)).to.match('drawer-layout__vertical_full.golden');
    });
  });

  test('styleWidth$', () => {
    should('render the max size if vertical and expanded', () => {
      _.element.setAttribute('mode', DrawerMode.VERTICAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(snapshotElement(_.element)).to.match('drawer-layout__vertical_expanded.golden');
    });

    should('render the min size if vertical and collapsed', () => {
      _.element.setAttribute('mode', DrawerMode.VERTICAL);
      _.element.setAttribute('max-size', '123px');

      assert(snapshotElement(_.element)).to.match('drawer-layout__vertical_collapsed.golden');
    });

    should('render \'100%\' if horizontal', () => {
      _.element.setAttribute('mode', DrawerMode.HORIZONTAL);
      _.element.setAttribute('max-size', '123px');
      _.element.setAttribute('expanded', '');

      assert(snapshotElement(_.element)).to.match('drawer-layout__horizontal_full.golden');
    });
  });
});
