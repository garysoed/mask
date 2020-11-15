import {Vine} from 'grapevine';
import {arrayThat, assert, createSpyInstance, fake, should, spy, test} from 'gs-testing';
import {CustomElementCtrl} from 'persona';

import {Theme} from '../theme/theme';

import {_p, start} from './app';


type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

test('app.App', () => {
  test('start', () => {
    should('build all the constructors and configure all the configs', () => {
      const styleEl = document.createElement('style');
      const personaBuilderBuildSpy = spy(_p, 'build');

      const mockTheme = createSpyInstance(Theme);
      fake(mockTheme.getStyleEl).always().return(styleEl);
      const mockVineImpl = createSpyInstance(Vine);
      fake(personaBuilderBuildSpy).always().return({vine: mockVineImpl});

      start('test', [], document, mockTheme, document.createElement('div'), window.customElements);

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(
          'test',
          arrayThat<CustomElementCtrlCtor>().beEmpty(),
          document,
          window.customElements,
      );
      assert(mockTheme.getStyleEl).to.haveBeenCalledWith();
    });
  });
});
