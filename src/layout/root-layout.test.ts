import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {ElementHarness, getHarness} from 'persona/export/testing';

import maskSvg from '../asset/mask.svg';
import {registerSvg} from '../core/svg-service';
import {setupThemedTest} from '../testing/setup-themed-test';
import {MEDIA_QUERY} from '../theme/media-query';

import goldens from './goldens/goldens.json';
import {ROOT_LAYOUT} from './root-layout';


test('@mask/src/layout/root-layout', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/layout/goldens', goldens));
    const tester = setupThemedTest({
      roots: [ROOT_LAYOUT],
    });
    registerSvg(tester.vine, 'icon', {type: 'embed', content: maskSvg});

    const drawerEl = document.createElement('div');
    drawerEl.textContent = 'Drawer';
    drawerEl.setAttribute('slot', 'drawer');

    const mainEl = document.createElement('div');
    mainEl.textContent = 'Main';
    mainEl.setAttribute('slot', 'main');

    const element = tester.bootstrapElement(ROOT_LAYOUT);
    element.appendChild(drawerEl);
    element.appendChild(mainEl);
    element.setAttribute('icon', 'icon');
    element.setAttribute('label', 'Label');

    return {element, tester};
  });

  test('handleDrawerExpandCollapse', () => {
    should('open the drawer if hovered', () => {
      const harness = getHarness(_.element, '#drawer', ElementHarness);
      harness.simulateMouseOver();

      assert(snapshotElement(_.element)).to.match('root-layout__mouseover.golden');
    });

    should('collapse the drawer if not hovered and is not desktop', () => {
      const harness = getHarness(_.element, '#drawer', ElementHarness);
      harness.simulateMouseOver();
      harness.simulateMouseOut();

      assert(snapshotElement(_.element)).to.match('root-layout__mouseout.golden');
    });

    should('open the drawer if desktop sized', () => {
      _.tester.setMedia(`(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`, true);

      assert(snapshotElement(_.element)).to.match('root-layout__desktop.golden');
    });
  });
});
