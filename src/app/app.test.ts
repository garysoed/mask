import { Vine } from 'grapevine';
import { arrayThat, assert, createSpyInstance, fake, should, spy, test } from 'gs-testing';
import { CustomElementCtrl } from 'persona';
import { BehaviorSubject } from 'rxjs';

import { Palette } from '../theme/palette';
import { Theme } from '../theme/theme';

import { $theme, _p, start } from './app';

type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

test('app.App', () => {
  test('start', () => {
    should(`build all the constructors and configure all the configs`, () => {
      const styleEl = document.createElement('style');
      const personaBuilderBuildSpy = spy(_p, 'build');

      const mockTheme = createSpyInstance(Theme);
      fake(spy($theme, 'get')).always()
          .return(new BehaviorSubject(new Theme(document, Palette.AMBER, Palette.AZURE)));

      const mockVineImpl = createSpyInstance(Vine);
      fake(personaBuilderBuildSpy).always().return({vine: mockVineImpl});

      start('test', [], document, mockTheme, styleEl, window.customElements);

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(
          'test',
          arrayThat<CustomElementCtrlCtor>().beEmpty(),
          document,
          window.customElements,
      );
      assert(mockTheme.injectCss).to.haveBeenCalledWith(styleEl);
    });
  });
});
