import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { attributeOut, booleanParser, element, host, PersonaContext, setAttribute } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $ as $baseAction, $$ as $$baseAction, BaseAction } from './base-action';


const $ = {
  div: element('div', instanceofType(HTMLDivElement), {
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
class TestAction extends BaseAction {
  constructor(context: PersonaContext) {
    super($.div._.disabled, context);
  }
}

const factory = new PersonaTesterFactory(_p);
test('@mask/action/base-action', init => {
  const _ = init(() => {
    const tester = factory.build([TestAction], document);
    const el = tester.createElement('mk-test-base-action');
    return {el, tester};
  });

  test('ariaDisabled$', () => {
    should(`set the aria value correctly`, () => {
      _.el.setHasAttribute($.host._.disabled, true);

      assert(_.el.getAttribute($baseAction.host._.ariaDisabled)).to.emitWith('true');

      _.el.setHasAttribute($.host._.disabled, false);

      assert(_.el.getAttribute($baseAction.host._.ariaDisabled)).to.emitWith('');
    });
  });

  test('isPrimaryAction$', () => {
    should(`render mk-action-1 if primary`, () => {
      _.el.setHasAttribute($.host._.isSecondary, false);

      assert(_.el.hasAttribute($.host._.action1)).to.equal(true);
      assert(_.el.hasAttribute($.host._.action2)).to.equal(false);
    });

    should(`render mk-action-2 if secondary`, () => {
      _.el.setHasAttribute($.host._.isSecondary, true);

      assert(_.el.hasAttribute($.host._.action1)).to.equal(false);
      assert(_.el.hasAttribute($.host._.action2)).to.equal(true);
    });
  });
});
