import { assert, run, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { attributeOut, booleanParser, element, PersonaContext } from 'persona';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $ as $baseAction, $$ as $$baseAction, BaseAction } from './base-action';


const $ = {
  div: element('div', instanceofType(HTMLDivElement), {
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
  constructor(context: PersonaContext) {
    super($.div._.disabled, context);
  }
}

const factory = new PersonaTesterFactory(_p);
test('@mask/action/base-action', init => {
  const _ = init(() => {
    const tester = factory.build([TestAction], document);
    const el = tester.createElement('mk-test-base-action', document.body);
    return {el, tester};
  });

  test('renderAriaDisabled', () => {
    should(`set the aria value correctly`, () => {
      run(_.el.setHasAttribute($.host._.disabled, true));

      assert(_.el.getAttribute($baseAction.host._.ariaDisabled)).to.emitWith('true');

      run(_.el.setHasAttribute($.host._.disabled, false));

      assert(_.el.getAttribute($baseAction.host._.ariaDisabled)).to.emitWith('');
    });
  });
});
