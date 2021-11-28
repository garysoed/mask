import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {flattenNode, setupTest} from 'persona/export/testing';

import maskSvg from '../../demo-next/asset/mask.svg';
import {registerSvg} from '../core/svg-service';
import {THEME_LOADER_TEST_OVERRIDE} from '../testing/theme-loader-test-override';

import goldens from './goldens/goldens.json';
import {FitTo, ICON} from './icon';


const SVG_NAME = 'svgName';


test('@mask/src/display/icon', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/display/goldens', goldens));
    const tester = setupTest({
      roots: [ICON],
      overrides: [THEME_LOADER_TEST_OVERRIDE],
    });
    registerSvg(tester.vine, SVG_NAME, {type: 'embed', content: maskSvg});

    return {tester};
  });

  test('rootSvg$', () => {
    should('set the innerHTML correctly and set the height to auto when fit to height', () => {
      const element = _.tester.createElement(ICON);
      element.setAttribute('fit-to', FitTo.HEIGHT);
      element.setAttribute('icon', SVG_NAME);

      assert(flattenNode(element)).to.matchSnapshot('icon__fit-to-height.html');
    });

    should('set the innerHTML correctly and set the width to auto when fit to width', () => {
      const element = _.tester.createElement(ICON);
      element.setAttribute('fit-to', FitTo.WIDTH);
      element.setAttribute('icon', SVG_NAME);

      assert(flattenNode(element)).to.matchSnapshot('icon__fit-to-width.html');
    });

    should('set the innerHTML correctly if there are no SVG names specified', () => {
      const element = _.tester.createElement(ICON);

      assert(flattenNode(element)).to.matchSnapshot('icon__no-svg.html');
    });
  });
});
