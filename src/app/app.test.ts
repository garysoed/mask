import { Vine } from '@grapevine';
import { assert, match, should, test } from '@gs-testing/main';
import { createSpyInstance, fake, spy } from '@gs-testing/spy';
import { CustomElementCtrl } from '@persona';
import { Palette } from 'export';
import { BehaviorSubject } from 'rxjs';
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
          .return(new BehaviorSubject(new Theme(Palette.AMBER, Palette.AZURE)));

      const mockVineImpl = createSpyInstance(Vine);
      fake(personaBuilderBuildSpy).always().return({vine: mockVineImpl});

      start('test', [], mockTheme, styleEl, window.customElements);

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(
          'test',
          match.anyIterableThat<CustomElementCtrlCtor, CustomElementCtrlCtor[]>().haveElements([]),
          window.customElements,
      );
      assert(mockTheme.injectCss).to.haveBeenCalledWith(styleEl);
    });
  });
});
