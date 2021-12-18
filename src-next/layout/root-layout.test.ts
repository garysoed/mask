import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {getEl} from 'persona/export/testing';

import maskSvg from '../../demo-next/asset/mask.svg';
import {registerSvg} from '../core/svg-service';
import {setupThemedTest} from '../testing/setup-themed-test';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';
import {MEDIA_QUERY} from '../theme/media-query';

import goldens from './goldens/goldens.json';
import {ROOT_LAYOUT} from './root-layout';


test('@mask/src/layout/root-layout', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/layout/goldens', goldens));
    const tester = setupThemedTest({
      roots: [ROOT_LAYOUT],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    registerSvg(tester.vine, 'icon', {type: 'embed', content: maskSvg});

    const drawerEl = document.createElement('div');
    drawerEl.textContent = 'Drawer';
    drawerEl.setAttribute('slot', 'drawer');

    const mainEl = document.createElement('div');
    mainEl.textContent = 'Main';
    mainEl.setAttribute('slot', 'main');

    const element = tester.createElement(ROOT_LAYOUT);
    element.appendChild(drawerEl);
    element.appendChild(mainEl);
    element.setAttribute('icon', 'icon');
    element.setAttribute('label', 'Label');

    return {element, tester};
  });

  test('handleDrawerExpandCollapse', () => {
    should('open the drawer if hovered', () => {
      const drawer = getEl(_.element, 'drawer')!;
      drawer.simulateMouseOver();

      assert(_.element).to.matchSnapshot('root-layout__mouseover.html');
    });

    should('collapse the drawer if not hovered and is not desktop', () => {
      const drawer = getEl(_.element, 'drawer')!;
      drawer.simulateMouseOver();
      drawer.simulateMouseOut();

      assert(_.element).to.matchSnapshot('root-layout__mouseout.html');
    });

    should('open the drawer if desktop sized', () => {
      _.tester.setMedia(`(min-width: ${MEDIA_QUERY.MIN_WIDTH.DESKTOP})`, true);

      assert(_.element).to.matchSnapshot('root-layout__desktop.html');
    });
  });
});
