import { VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpyInstance, fake, spy, Spy } from 'gs-testing/export/spy';
import { CustomElementCtrl } from 'persona/export/main';
import { of as observableOf } from 'rxjs';
import { Theme } from '../theme/theme';
import { _p, _v, start } from './app';

type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

test('app.App', () => {
  test('start', () => {
    should(`build all the constructors and configure all the configs`, () => {
      const styleEl = document.createElement('style');
      const personaBuilderBuildSpy = spy(_p.builder, 'build');

      const mockTheme = createSpyInstance(Theme);

      const mockVineImpl = createSpyInstance(VineImpl);
      fake(mockVineImpl.getObservable).always().return(observableOf(mockTheme));
      fake(spy(_v.builder, 'run')).always().return(mockVineImpl);
      fake(personaBuilderBuildSpy).always().return({vine: mockVineImpl});

      start([], mockTheme, styleEl, window.customElements);

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(
          match.anyIterableThat<CustomElementCtrlCtor, CustomElementCtrlCtor[]>().haveElements([]),
          window.customElements,
          _v.builder,
      );
      assert(mockTheme.injectCss).to.haveBeenCalledWith(styleEl);
    });
  });
});
