import { assert, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../../app/app';
import { $stateService } from '../../core/state-service';

import { $, $textInput, TextInput } from './text-input';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/text-input', init => {
  const _ = init(() => {
    const tester = testerFactory.build([TextInput], document);
    const el = tester.createElement($textInput.tag);

    const stateService = new StateService();
    $stateService.set(tester.vine, () => stateService);

    const $state = stateService.add<string>('init state');
    el.setAttribute($.host._.stateId, $state);

    return {$state, el, stateService, tester};
  });

  test('domValue$', () => {
    should(`emit the correct value`, () => {
      // Change the input and wait for the value to update.
      const value = 'value';
      _.el.setInputValue($.input, value);

      _.el.dispatchEvent($.input._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.get(_.$state)).to.emitWith(value);
    });
  });

  test('updateDomValue', () => {
    should(`set the value correctly`, () => {
      const value = 'value';

      _.stateService.set(_.$state, value);
      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.input).value).to.equal(value);
    });
  });
});
