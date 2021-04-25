import {arrayThat, assert, objectThat, should, spy, test} from 'gs-testing';
import {Config, CustomElementCtrl} from 'persona';

import {ThemeClassLoader} from '../theme/loader/theme-class-loader';
import {PALETTE} from '../theme/palette';
import {Theme} from '../theme/theme';

import {start, _p} from './app';


type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

test('app.App', () => {
  test('start', () => {
    should('build all the constructors and configure all the configs', () => {
      const personaBuilderBuildSpy = spy(_p, 'build');

      const theme = new Theme(PALETTE.GREEN, PALETTE.PURPLE);

      start(
          'test',
          [],
          document,
          new ThemeClassLoader(theme),
          document.createElement('div'),
          window.customElements,
      );

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(objectThat<Config>().haveProperties({
        rootCtrls: arrayThat<CustomElementCtrlCtor>().beEmpty(),
        rootDoc: document,
        customElementRegistry: window.customElements,
      }));
    });
  });
});
