import { NodeId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should } from 'gs-testing/export/main';
import { createSpy, createSpyInstance, fake, spy, Spy } from 'gs-testing/export/spy';
import { CustomElementCtrl } from 'persona/export/main';
import { Theme } from '../theme/theme';
import { $theme, addToMapConfig_, flattenConfigs_, persona_, start, vine_ } from './app';

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

describe('app.App', () => {
  describe('addToMapConfig_', () => {
    should(`add to map if the config doesn't exist yet`, () => {
      const map = new Map();
      const config = {ctor: TestClass1};
      addToMapConfig_(map, config);

      assert(map).to.haveElements([[TestClass1, config]]);
    });

    should(`add to map if the config exists, but exactly the same`, () => {
      const config = {ctor: TestClass1};
      const map = new Map([[TestClass1, config]]);
      addToMapConfig_(map, config);

      assert(map).to.haveElements([[TestClass1, config]]);
    });

    should(`throw error if the config exists with a different config`, () => {
      const config = {ctor: TestClass1};
      const map = new Map([[TestClass1, {ctor: TestClass1}]]);

      assert(() => {
        addToMapConfig_(map, config);
      }).to.throwErrorWithMessage(/not be defined differently/);
    });
  });

  describe('flattenConfigs_', () => {
    should(`grab all the dependencies correctly`, () => {
      const config1 = {ctor: TestClass1};
      const config2 = {ctor: TestClass2, dependencies: [config1]};
      const config3 = {ctor: TestClass3};

      assert(flattenConfigs_([config1, config2, config3])).to.haveElements([
        [TestClass1, config1],
        [TestClass2, config2],
        [TestClass3, config3],
      ]);
    });
  });

  describe('start', () => {
    should(`build all the constructors and configure all the configs`, () => {
      const styleEl = document.createElement('style');
      const mockConfigure = createSpy<void, [VineImpl]>('Configure');
      const personaBuilderBuildSpy = spy(persona_.builder, 'build');

      const mockVineImpl = createSpyInstance(VineImpl);
      fake(spy(vine_.builder, 'run')).always().return(mockVineImpl);

      const mockTheme = createSpyInstance(Theme);

      const config1 = {ctor: TestClass1};
      const config2 = {ctor: TestClass2, dependencies: [config1]};
      const config3 = {ctor: TestClass3, configure: mockConfigure};

      start([config1, config2, config3], mockTheme, styleEl, window.customElements);

      assert(mockConfigure).to.haveBeenCalledWith(mockVineImpl);
      assert(personaBuilderBuildSpy).to.haveBeenCalledWith(
          match.anyIterableThat<typeof CustomElementCtrl, (typeof CustomElementCtrl)[]>()
              .haveElements([TestClass1, TestClass2, TestClass3]),
          window.customElements,
          mockVineImpl);
      assert(mockTheme);

      const listenFnMatch = match.anyObjectThat<(theme: Theme) => void>()
          .beAnInstanceOf(Function as any);

      type ListenFnSpy = Spy<() => void, [(v: Theme) => void, NodeId<Theme>]>;
      assert(mockVineImpl.listen as any as ListenFnSpy)
          .to.haveBeenCalledWith(listenFnMatch, $theme);
    });
  });
});
