import {arrayThat, assert, createSpyInstance, fake, objectThat, should, spy, test} from 'gs-testing';
import {Config, CustomElementCtrl} from 'persona';

import {Theme} from '../theme/theme';

import {start, _p} from './app';


type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

test('app.App', () => {
  test('start', () => {
    should('build all the constructors and configure all the configs', () => {
      const styleEl = document.createElement('style');
      const personaBuilderBuildSpy = spy(_p, 'build');

      const mockTheme = createSpyInstance(Theme);
      fake(mockTheme.getStyleEl).always().return(styleEl);

      start('test', [], document, mockTheme, document.createElement('div'), window.customElements);

      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(objectThat<Config>().haveProperties({
        rootCtrls: arrayThat<CustomElementCtrlCtor>().beEmpty(),
        rootDoc: document,
        customElementRegistry: window.customElements,
      }));
      assert(mockTheme.getStyleEl).to.haveBeenCalledWith();
    });
  });
});
