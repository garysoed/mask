import {arrayThat, assert, objectThat, should, spy, test} from 'gs-testing';
import {Config} from 'persona';
import {BaseCtrlCtor} from 'persona/export/internal';

import {ClassThemeLoader} from '../theme/loader/class-theme-loader';
import {PALETTE} from '../theme/palette';
import {Theme} from '../theme/theme';

import {start, _p} from './app';


test('app.App', () => {
  test('start', () => {
    should('build all the constructors and configure all the configs', () => {
      const personaBuilderBuildSpy = spy(_p, 'build');

      const theme = new Theme(PALETTE.GREEN, PALETTE.PURPLE);

      start(
          'test',
          [],
          document,
          new ClassThemeLoader(theme),
          window.customElements,
      );

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(objectThat<Config>().haveProperties({
        rootCtrls: arrayThat<BaseCtrlCtor<{}>>().beEmpty(),
        rootDoc: document,
        customElementRegistry: window.customElements,
      }));
    });
  });
});
