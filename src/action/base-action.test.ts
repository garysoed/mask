import { assert, setup, should, test } from 'gs-testing';
import { InstanceofType } from 'gs-types';
import { attributeOut, element } from 'persona';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';
import { booleanParser } from '../util/parsers';

import { $ as $baseAction, $$ as $$baseAction, BaseAction } from './base-action';

const $ = {
  div: element('div', InstanceofType(HTMLDivElement), {
    disabled: attributeOut('disabled', booleanParser(), false),
  }),
  host: element({
    ...$$baseAction,
  }),
};

@_p.customElement({
  tag: 'mk-test-base-action',
  template: '<style id="theme"></style><div id="div"></div>',
})
class TestAction extends BaseAction {
  constructor(root: ShadowRoot) {
    super($.div._.disabled, root);
  }
}

const factory = new PersonaTesterFactory(_p);
test('@mask/action/base-action', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([TestAction]);
    el = tester.createElement('mk-test-base-action', document.body);
  });

  test('renderAriaDisabled', () => {
    should(`set the aria value correctly`, () => {
      el.setHasAttribute($.host._.disabled, true).subscribe();

      assert(el.getAttribute($baseAction.host._.ariaDisabled)).to.emitWith('true');

      el.setHasAttribute($.host._.disabled, false).subscribe();

      assert(el.getAttribute($baseAction.host._.ariaDisabled)).to.emitWith('');
    });
  });
});
