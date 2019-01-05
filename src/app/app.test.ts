import { VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpy, createSpyInstance, fake, spy, Spy } from 'gs-testing/export/spy';
import { CustomElementCtrl } from 'persona/export/main';
import { of as observableOf } from 'rxjs';
import { Theme } from '../theme/theme';
import { _p, _v, addToMapConfig_, flattenConfigs_, start } from './app';

/**
 * @test
 */
class TestClass1 extends CustomElementCtrl {
  init(): void {
    throw new Error('Method not implemented.');
  }
}

/**
 * @test
 */
class TestClass2 extends CustomElementCtrl {
  init(): void {
    throw new Error('Method not implemented.');
  }
}

/**
 * @test
 */
class TestClass3 extends CustomElementCtrl {
  init(): void {
    throw new Error('Method not implemented.');
  }
}

test('app.App', () => {
  test('addToMapConfig_', () => {
    should(`add to map if the config doesn't exist yet`, () => {
      const map = new Map();
      const config = {tag: 'TestClass1'};
      addToMapConfig_(map, config);

      assert(map).to.haveElements([['TestClass1', config]]);
    });

    should(`add to map if the config exists, but exactly the same`, () => {
      const config = {tag: 'TestClass1'};
      const map = new Map([['TestClass1', config]]);
      addToMapConfig_(map, config);

      assert(map).to.haveElements([['TestClass1', config]]);
    });

    should(`throw error if the config exists with a different config`, () => {
      const config = {tag: 'TestClass1'};
      const map = new Map([['TestClass1', {tag: 'TestClass1'}]]);

      assert(() => {
        addToMapConfig_(map, config);
      }).to.throwErrorWithMessage(/not be defined differently/);
    });
  });

  test('flattenConfigs_', () => {
    should(`grab all the dependencies correctly`, () => {
      const config1 = {tag: 'TestClass1'};
      const config2 = {tag: 'TestClass2', dependencies: [config1]};
      const config3 = {tag: 'TestClass3'};

      assert(flattenConfigs_([config1, config2, config3])).to.haveElements([
        ['TestClass1', config1],
        ['TestClass2', config2],
        ['TestClass3', config3],
      ]);
    });
  });

  test('start', () => {
    should(`build all the constructors and configure all the configs`, () => {
      const styleEl = document.createElement('style');
      const mockConfigure = createSpy<void, [VineImpl]>('Configure');
      const personaBuilderBuildSpy = spy(_p.builder, 'build');

      const mockTheme = createSpyInstance(Theme);

      const mockVineImpl = createSpyInstance(VineImpl);
      fake(mockVineImpl.getObservable).always().return(observableOf(mockTheme));
      fake(spy(_v.builder, 'run')).always().return(mockVineImpl);

      const config1 = {tag: 'TestClass1'};
      const config2 = {tag: 'TestClass2', dependencies: [config1]};
      const config3 = {tag: 'TestClass3', configure: mockConfigure};

      start([config1, config2, config3], mockTheme, styleEl, window.customElements);

      assert(mockConfigure).to.haveBeenCalledWith(mockVineImpl);
      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(
          match.anyIterableThat<string, string[]>().haveElements([]),
          window.customElements,
          mockVineImpl);
      assert(mockTheme.injectCss).to.haveBeenCalledWith(styleEl);
    });
  });
});
