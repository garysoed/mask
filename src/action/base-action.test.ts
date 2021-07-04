import {assert, should, test} from 'gs-testing';
import {$div, attributeOut, booleanParser, element, host, PersonaContext, setAttribute} from 'persona';
import {PersonaTesterFactory} from 'persona/export/testing';
import {Observable} from 'rxjs';

import {_p} from '../app/app';

import {$baseAction as $$baseAction, BaseAction} from './base-action';


const $ = {
  div: element('div', $div, {
    disabled: attributeOut('disabled', booleanParser(), false),
  }),
  host: host({
    ...$$baseAction.api,
    action1: setAttribute('mk-action-1'),
    action2: setAttribute('mk-action-2'),
  }),
};

@_p.customElement({
  api: $$baseAction.api,
  tag: 'mk-test-base-action',
  template: '<div id="div"></div>',
})
class TestAction extends BaseAction<typeof $> {
  constructor(context: PersonaContext) {
    super($.div._.disabled, context, $, $.host._);
  }

  get renders(): ReadonlyArray<Observable<unknown>> {
    return [...super.renders];
  }
}

const factory = new PersonaTesterFactory(_p);
test('@mask/action/base-action', init => {
  const _ = init(() => {
    const tester = factory.build({rootCtrls: [TestAction], rootDoc: document});
    const {harness} = tester.createHarness(TestAction);
    return {harness, tester};
  });

  test('ariaDisabled$', () => {
    should('set the aria value correctly', () => {
      _.harness.host._.disabled(true);

      assert(_.harness.host._.ariaDisabled).to.emitWith('true');

      _.harness.host._.disabled(false);

      assert(_.harness.host._.ariaDisabled).to.emitWith('');
    });
  });

  test('isPrimaryAction$', () => {
    should('render mk-action-1 if primary', () => {
      _.harness.host._.isSecondary(false);

      assert(_.harness.host._.action1).to.emitWith(true);
      assert(_.harness.host._.action2).to.emitWith(false);
    });

    should('render mk-action-2 if secondary', () => {
      _.harness.host._.isSecondary(true);

      assert(_.harness.host._.action1).to.emitWith(false);
      assert(_.harness.host._.action2).to.emitWith(true);
    });
  });
});
