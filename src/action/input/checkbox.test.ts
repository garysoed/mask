import {$stateService} from 'grapevine';
import {assert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {fakeStateService} from 'gs-tools/export/state';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../../app/app';
import {THEME_LOADER_TEST_OVERRIDE} from '../../testing/theme-loader-test-override';
import {$, Checkbox, CheckedValue} from '../input/checkbox';

import goldenChecked from './goldens/checkbox__checked.txt';
import goldenDefault from './goldens/checkbox__default.txt';
import goldenUnchecked from './goldens/checkbox__unchecked.txt';
import goldenUnknown from './goldens/checkbox__unknown.txt';
import goldenUpdate from './goldens/checkbox__update.txt';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/input/checkbox', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv({
      render: goldenDefault,
      checked: goldenChecked,
      unchecked: goldenUnchecked,
      unknown: goldenUnknown,
      update: goldenUpdate,
    }));

    const stateService = fakeStateService();
    const tester = testerFactory.build({
      overrides: [
        THEME_LOADER_TEST_OVERRIDE,
        {override: $stateService, withValue: stateService},
      ],
      rootCtrls: [Checkbox],
      rootDoc: document,
    });

    const el = tester.createElement(Checkbox);
    const $state = stateService.modify(x => x.add<CheckedValue>(true));
    el.setAttribute($.host._.stateId, $state);

    return {el, $state, stateService};
  });

  test('render', () => {
    should('render default config correctly', () => {
      _.el.setAttribute($.host._.label, 'label');

      assert(_.el.flattenContent()).to.matchSnapshot('render');
    });
  });

  test('checkMode$', () => {
    setup(() => {
      _.el.setAttribute($.host._.label, 'label');
    });

    should('set the classlist to display_checked if checked', () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_checked']));
      assert(_.el.flattenContent()).to.matchSnapshot('checked');
    });

    should('set the classlist to display_unchecked if unchecked', () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = false;
      _.el.dispatchEvent($.checkbox._.onInput);

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_unchecked']));
      assert(_.el.flattenContent()).to.matchSnapshot('unchecked');
    });

    should('set the classlist to display_unknown if unknown', () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = true;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_unknown']));
      assert(_.el.flattenContent()).to.matchSnapshot('unknown');
    });

    should('update the slot name if the value is set by calling clear', () => {
      _.stateService.modify(x => x.set(_.$state, true));
      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getClassList($.container)).to.haveExactElements(new Set(['display_checked']));
      assert(_.el.flattenContent()).to.matchSnapshot('update');
    });
  });

  test('domValue$', () => {
    should('emit true if the checked', () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith(true);
    });

    should('emit false if the unchecked', () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = false;
      el.checked = false;
      _.el.dispatchEvent($.checkbox._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith(false);
    });

    should('emit unknown if the value is indeterminate', () => {
      const el = _.el.getElement($.checkbox);
      el.indeterminate = true;
      el.checked = true;
      _.el.dispatchEvent($.checkbox._.onInput);
      _.el.callFunction($.host._.applyFn, []);

      assert(_.stateService.resolve(_.$state)).to.emitWith('unknown');
    });
  });

  test('updateDomValue', () => {
    should('set true value correctly', () => {
      _.stateService.modify(x => x.set(_.$state, true));

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.checkbox).checked).to.equal(true);
      assert(_.el.getElement($.checkbox).indeterminate).to.equal(false);
    });

    should('set false value correctly', () => {
      _.stateService.modify(x => x.set(_.$state, false));

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.checkbox).checked).to.equal(false);
      assert(_.el.getElement($.checkbox).indeterminate).to.equal(false);
    });

    should('set unknown value correctly', () => {
      _.stateService.modify(x => x.set(_.$state, 'unknown'));

      _.el.callFunction($.host._.clearFn, []);

      assert(_.el.getElement($.checkbox).checked).to.equal(false);
      assert(_.el.getElement($.checkbox).indeterminate).to.equal(true);
    });
  });
});
