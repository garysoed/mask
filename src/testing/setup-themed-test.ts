import {Vine} from 'grapevine';
import {FakeTime} from 'gs-testing';
import {ElementSpec, Registration} from 'persona';
import {TestSpec, Tester, setupTest} from 'persona/export/testing';

import {THEME_LOADER_TEST_OVERRIDE} from './theme-loader-test-override';


class ThemedTester implements Omit<Tester, 'createElement'> {
  constructor(private readonly baseTester: Tester) { }

  get fakeTime(): FakeTime {
    return this.baseTester.fakeTime;
  }

  get vine(): Vine {
    return this.baseTester.vine;
  }

  setMedia(query: string, value: boolean): void {
    this.baseTester.setMedia(query, value);
  }

  createElement<E extends HTMLElement, S extends ElementSpec>(
      spec: Registration<E, S>,
      darkMode = false,
  ): E {
    const el = this.baseTester.createElement(spec);
    el.setAttribute('mk-theme', darkMode ? 'dark' : 'light');

    return el;
  }
}

export function setupThemedTest(spec: TestSpec): ThemedTester {
  const baseTester = setupTest({
    ...spec,
    overrides: [
      THEME_LOADER_TEST_OVERRIDE,
      ...(spec.overrides ?? []),
    ],
  });
  const tester = new ThemedTester(baseTester);
  return tester;
}