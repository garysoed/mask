import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';

import goldens from './goldens/goldens.json';
import {PALETTE} from './palette';
import {Theme} from './theme';
import template from './theme.html';


test('@mask/src/theme/theme', () => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv(
        'src-next/theme/goldens',
        goldens,
    ));
  });

  test('generateCss', init => {
    const _ = init(() => {
      const cssString = new Theme(PALETTE.AMBER, PALETTE.GREEN).generateCss();

      const styleEl = document.createElement('style');
      styleEl.innerHTML = cssString;

      const rootEl = document.createElement('div');
      rootEl.innerHTML = template;
      rootEl.appendChild(styleEl);

      return {
        rootEl,
        tableEl: rootEl.querySelector('#table')!,
      };
    });

    should('generate light CSS correctly', () => {
      _.tableEl.setAttribute('mk-theme', 'light');

      assert(_.rootEl).to.matchSnapshot('theme__light.html');
    });

    should('generate dark CSS correctly', () => {
      _.tableEl.setAttribute('mk-theme', 'dark');

      assert(_.rootEl).to.matchSnapshot('theme__dark.html');
    });
  });
});
