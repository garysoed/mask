import { assert, match, setup, should, test } from '@gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { _p } from '../app/app';
import { $, IconWithText } from './icon-with-text';

const testerFactory = new PersonaTesterFactory(_p);

test('display.IconWithText', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([IconWithText]);
    el = tester.createElement('mk-icon-with-text', document.body);
  });

  should(`render the text and icon correctly`, () => {
    const iconLigature = 'iconLigature';
    const label = 'label';

    el.setAttribute($.host._.icon, iconLigature).subscribe();
    el.setAttribute($.host._.label, label).subscribe();

    assert(el.getTextContent($.text)).to.emitWith(label);
    assert(el.getAttribute($.icon._.icon)).to.emitWith(iconLigature);
  });

  test('renderIconClasses', () => {
    should(`render 'hasIcon' class if icon attribute is set`, () => {
      const iconLigature = 'iconLigature';
      el.setAttribute($.host._.icon, iconLigature).subscribe();

      assert(el.getClassList($.icon)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().haveElements(['hasIcon']));
    });

    should(`render nothing if the icon attribute is not set`, () => {
      assert(el.getClassList($.icon)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().beEmpty());
    });
  });

  test('renderTextClasses', () => {
    should(`render 'hasText' class if the label is set`, () => {
      const label = 'label';
      el.setAttribute($.host._.label, label).subscribe();

      assert(el.getClassList($.text)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().haveElements(['hasText']));
    });

    should(`render nothing if the slot is empty`, () => {
      assert(el.getClassList($.text)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().beEmpty());
    });
  });
});
