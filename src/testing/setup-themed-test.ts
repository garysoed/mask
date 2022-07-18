import {Vine} from 'grapevine';
import {FakeTime} from 'gs-testing';
import {CustomElementRegistration, ElementSpec} from 'persona';
import {setupTest, Tester, TestSpec} from 'persona/export/testing';

import {THEME_LOADER_TEST_OVERRIDE} from './theme-loader-test-override';


class ThemedTester implements Omit<Tester, 'bootstrapElement'> {
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

  teardown(): void {
    this.baseTester.teardown();
  }

  bootstrapElement<E extends HTMLElement, S extends ElementSpec>(
      spec: CustomElementRegistration<E, S>,
      darkMode = false,
  ): E {
    const el = this.baseTester.bootstrapElement(spec);
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