import { assert, run, setThat, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, IconWithText } from './icon-with-text';


const testerFactory = new PersonaTesterFactory(_p);

test('display.IconWithText', init => {
  const _ = init(() => {
    const tester = testerFactory.build([IconWithText], document);
    const el = tester.createElement('mk-icon-with-text', document.body);
    return {el, tester};
  });

  should(`render the text and icon correctly`, () => {
    const iconLigature = 'iconLigature';
    const label = 'label';

    run(_.el.setAttribute($.host._.icon, iconLigature));
    run(_.el.setAttribute($.host._.label, label));

    assert(_.el.getTextContent($.text)).to.emitWith(label);
    assert(_.el.getAttribute($.icon._.icon)).to.emitWith(iconLigature);
  });

  test('renderIconClasses', () => {
    should(`render 'hasIcon' class if icon attribute is set`, () => {
      const iconLigature = 'iconLigature';
      run(_.el.setAttribute($.host._.icon, iconLigature));

      assert(_.el.getClassList($.icon)).to
          .emitWith(setThat<string>().haveExactElements(new Set(['hasIcon'])));
    });

    should(`render nothing if the icon attribute is not set`, () => {
      assert(_.el.getClassList($.icon)).to.emitWith(setThat<string>().beEmpty());
    });
  });

  test('renderTextClasses', () => {
    should(`render 'hasText' class if the label is set`, () => {
      const label = 'label';
      run(_.el.setAttribute($.host._.label, label));

      assert(_.el.getClassList($.text)).to
          .emitWith(setThat<string>().haveExactElements(new Set(['hasText'])));
    });

    should(`render nothing if the slot is empty`, () => {
      assert(_.el.getClassList($.text)).to.emitWith(setThat<string>().beEmpty());
    });
  });
});
