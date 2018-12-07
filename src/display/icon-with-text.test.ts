import { assert, setup, should, test } from 'gs-testing/export/main';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { icon } from './icon';
import { $, iconWithText } from './icon-with-text';

const configIcon = icon('', ImmutableMap.of([]));
const {tag} = iconWithText(configIcon);

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.IconWithText', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([tag]);
    el = tester.createElement(tag, document.body);
  });

  should(`render the text and icon correctly`, async () => {
    const iconLigature = 'iconLigature';
    const label = 'label';

    await tester.setAttribute(el, $.host.icon, iconLigature);
    await tester.setAttribute(el, $.host.label, label);

    assert(tester.getTextContent(el, $.text.text)).to.equal(label);
    assert(tester.getTextContent(el, $.icon.text)).to.equal(iconLigature);
  });

  test('renderIconClasses_', () => {
    should(`render 'hasIcon' class if icon attribute is set`, async () => {
      const iconLigature = 'iconLigature';
      await tester.setAttribute(el, $.host.icon, iconLigature);

      assert(tester.getClassList(el, $.icon.classes)).to.haveElements(['hasIcon']);
    });

    should(`render nothing if the icon attribute is not set`, async () => {
      assert(tester.getClassList(el, $.icon.classes)).to.haveElements([]);
    });
  });

  test('renderTextClasses_', () => {
    should(`render 'hasText' class if the slot if filled`, async () => {
      const label = 'label';
      await tester.setAttribute(el, $.host.label, label);

      assert(tester.getClassList(el, $.text.classes)).to.haveElements(['hasText']);
    });

    should(`render nothing if the slot is empty`, async () => {
      assert(tester.getClassList(el, $.text.classes)).to.haveElements([]);
    });
  });
});
