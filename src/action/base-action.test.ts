import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { InstanceofType } from '@gs-types';
import { attributeOut, element } from '@persona';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
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
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = factory.build([TestAction]);
    el = tester.createElement('mk-test-base-action', document.body);
  });

  test('renderAriaDisabled', () => {
    should(`set the aria value correctly`, () => {
      tester.setHasAttribute(el, $.host._.disabled, true).subscribe();

      assert(tester.getAttribute(el, $baseAction.host._.ariaDisabled)).to.emitWith('true');

      tester.setHasAttribute(el, $.host._.disabled, false).subscribe();

      assert(tester.getAttribute(el, $baseAction.host._.ariaDisabled)).to.emitWith('');
    });
  });
});
