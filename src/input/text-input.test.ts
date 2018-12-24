import { assert, retryUntil, setup, should, test } from 'gs-testing/export/main';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { ChangeEvent } from '../event/change-event';
import { $, textInput } from './text-input';

const {tag} = textInput();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('input.TextInput', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([tag]);
    el = tester.createElement('mk-text-input', document.body);
  });

  test('init', () => {
    should(`set the initial value correctly`, async () => {
      const initValue = 'initValue';

      tester.setAttribute_(el, $.host.valueIn, initValue);

      await retryUntil(() => tester.getProperty(el, $.input.el, 'value')).to.equal(initValue);
    });

    should(`dispatch the change event correctly`, async () => {
      const valueSubject = new BehaviorSubject<string|null>(null);
      fromEvent(el, 'mk-change')
          .pipe(
              filter((event: Event): event is ChangeEvent => event instanceof ChangeEvent),
              map((event: ChangeEvent) => event.value),
          )
          .subscribe(valueSubject);

      // Wait until the initial value has been set.
      const initValue = 'initValue';
      tester.setAttribute_(el, $.host.valueIn, initValue);
      await retryUntil(() => tester.getProperty(el, $.input.el, 'value')).to.equal(initValue);

      const value1 = 'value1';
      tester.setInputValue(el, $.input.el, value1);

      // At this point the event shouldn't have been fired.
      assert(valueSubject.getValue()).to.equal(initValue);

      const value2 = 'value2';
      tester.setInputValue(el, $.input.el, value2);

      // Shouldn't be fired here either, due to debounce.
      assert(valueSubject.getValue()).to.equal(initValue);

      // Now wait for the debounce. Should be called with the latest value.
      await retryUntil(() => valueSubject.getValue()).to.equal(value2);
      assert(tester.getAttribute(el, $.host.valueOut)).to.equal(value2);
    });
  });
});
