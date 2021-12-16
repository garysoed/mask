import {Vine} from 'grapevine';
import {FakeTime} from 'gs-testing';
import {ElementSpec, Registration} from 'persona';
import {TestSpec, Tester, setupTest} from 'persona/export/testing';


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
  const baseTester = setupTest(spec);
  const tester = new ThemedTester(baseTester);
  return tester;
}