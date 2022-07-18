import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';

import maskSvg from '../asset/mask.svg';
import {registerSvg} from '../core/svg-service';
import {setupThemedTest} from '../testing/setup-themed-test';

import goldens from './goldens/goldens.json';
import {FitTo, ICON} from './icon';


const SVG_NAME = 'svgName';


test('@mask/src/display/icon', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/display/goldens', goldens));
    const tester = setupThemedTest({roots: [ICON]});
    registerSvg(tester.vine, SVG_NAME, {type: 'embed', content: maskSvg});

    return {tester};
  });

  test('rootSvg$', () => {
    should('set the innerHTML correctly and set the height to auto when fit to height', () => {
      const element = _.tester.bootstrapElement(ICON);
      element.setAttribute('fit-to', FitTo.HEIGHT);
      element.setAttribute('icon', SVG_NAME);

      assert(element).to.matchSnapshot('icon__fit-to-height.html');
    });

    should('set the innerHTML correctly and set the width to auto when fit to width', () => {
      const element = _.tester.bootstrapElement(ICON);
      element.setAttribute('fit-to', FitTo.WIDTH);
      element.setAttribute('icon', SVG_NAME);

      assert(element).to.matchSnapshot('icon__fit-to-width.html');
    });

    should('set the innerHTML correctly if there are no SVG names specified', () => {
      const element = _.tester.bootstrapElement(ICON);

      assert(element).to.matchSnapshot('icon__no-svg.html');
    });
  });
});
