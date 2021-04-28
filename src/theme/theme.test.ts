import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';

import goldenDark from './goldens/theme__dark.html';
import goldenLight from './goldens/theme__light.html';
import {PALETTE} from './palette';
import {Theme} from './theme';
import template from './theme.html';


test('@mask/theme/theme', () => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv({light: goldenLight, dark: goldenDark}));
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

      assert(_.rootEl).to.matchSnapshot('light');
    });

    should('generate dark CSS correctly', () => {
      _.tableEl.setAttribute('mk-theme', 'dark');

      assert(_.rootEl).to.matchSnapshot('dark');
    });
  });
});
