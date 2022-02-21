import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';

import {ThemeMode} from './const';
import goldens from './goldens/goldens.json';
import {Theme} from './theme';
import {THEME_SEEDS} from './theme-seed';
import template from './theme.html';


test('@mask/src/theme/theme', () => {
  setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/theme/goldens', goldens));
  });

  test('generateCss', init => {
    const _ = init(() => {
      const styleEl = document.createElement('style');

      const rootEl = document.createElement('div');
      rootEl.innerHTML = template;
      rootEl.appendChild(styleEl);

      return {
        rootEl,
        tableEl: rootEl.querySelector('#table')!,
        styleEl,
      };
    });

    should('generate light CSS correctly', () => {
      const cssString = new Theme({
        baseSeed: THEME_SEEDS.AMBER,
        accentSeed: THEME_SEEDS.GREEN,
        mode: ThemeMode.LIGHT,
      }).generateCss();

      _.styleEl.innerHTML = cssString;
      assert(_.rootEl).to.matchSnapshot('theme__light.html');
    });

    should('generate dark CSS correctly', () => {
      const cssString = new Theme({
        baseSeed: THEME_SEEDS.AMBER,
        accentSeed: THEME_SEEDS.GREEN,
        mode: ThemeMode.DARK,
      }).generateCss();

      _.styleEl.innerHTML = cssString;
      _.tableEl.classList.add('dark');

      assert(_.rootEl).to.matchSnapshot('theme__dark.html');
    });
  });
});
