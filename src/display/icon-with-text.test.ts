import { assert, match, runEnvironment, setup, should, test } from '@gs-testing';
import { debug } from '@gs-tools/rxjs';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { _p } from '../app/app';
import { $, IconWithText } from './icon-with-text';

const testerFactory = new PersonaTesterFactory(_p);

test('display.IconWithText', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([IconWithText]);
    el = tester.createElement('mk-icon-with-text', document.body);
  });

  should(`render the text and icon correctly`, () => {
    const iconLigature = 'iconLigature';
    const label = 'label';

    tester.setAttribute(el, $.host._.icon, iconLigature).subscribe();
    tester.setAttribute(el, $.host._.label, label).subscribe();

    assert(tester.getTextContent(el, $.text)).to.emitWith(label);
    assert(tester.getAttribute(el, $.icon._.icon)).to.emitWith(iconLigature);
  });

  test('renderIconClasses', () => {
    should(`render 'hasIcon' class if icon attribute is set`, () => {
      const iconLigature = 'iconLigature';
      tester.setAttribute(el, $.host._.icon, iconLigature).subscribe();

      assert(tester.getClassList(el, $.icon)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().haveElements(['hasIcon']));
    });

    should(`render nothing if the icon attribute is not set`, () => {
      assert(tester.getClassList(el, $.icon)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().beEmpty());
    });
  });

  test('renderTextClasses', () => {
    should(`render 'hasText' class if the label is set`, () => {
      const label = 'label';
      tester.setAttribute(el, $.host._.label, label).subscribe();

      assert(tester.getClassList(el, $.text)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().haveElements(['hasText']));
    });

    should(`render nothing if the slot is empty`, () => {
      assert(tester.getClassList(el, $.text)).to
          .emitWith(match.anyIterableThat<string, Set<string>>().beEmpty());
    });
  });
});
