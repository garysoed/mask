import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { _p, _v } from '../app/app';
import { $, ListItem } from './list-item';

const testerFactory = new PersonaTesterFactory(_p);

test('mask.layout.ListItem', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([ListItem]);
    el = tester.createElement('mk-list-item', document.body);
  });

  test('renderIconContainerDisplayed', () => {
    should(`display if icon is specified`, () => {
      tester.setAttribute(el, $.host._.icon, 'icon').subscribe();

      assert(tester.getHasClass(el, $.iconContainer._.displayed)).to.emitWith(true);
    });

    should(`not display if icon is not specified`, () => {
      tester.setAttribute(el, $.host._.icon, '').subscribe();

      assert(tester.getHasClass(el, $.iconContainer._.displayed)).to.emitWith(false);
    });
  });

  test('renderItemDetailContainerDisplayed', () => {
    should(`display if item detail is specified`, () => {
      tester.setAttribute(el, $.host._.itemDetail, 'itemDetail').subscribe();

      assert(tester.getHasClass(el, $.itemDetailContainer._.displayed)).to.emitWith(true);
    });

    should(`not display if item detail is not specified`, () => {
      tester.setAttribute(el, $.host._.itemDetail, '').subscribe();

      assert(tester.getHasClass(el, $.itemDetailContainer._.displayed)).to.emitWith(false);
    });
  });

  test('renderItemNameContainerDisplayed', () => {
    should(`display if item name is specified`, () => {
      tester.setAttribute(el, $.host._.itemName, 'itemName').subscribe();

      assert(tester.getHasClass(el, $.itemNameContainer._.displayed)).to.emitWith(true);
    });

    should(`not display if item name is not specified`, () => {
      tester.setAttribute(el, $.host._.itemName, '').subscribe();

      assert(tester.getHasClass(el, $.itemNameContainer._.displayed)).to.emitWith(false);
    });
  });

  test('renderToolWidth', () => {
    const WIDTH = '20px';

    setup(() => {
      tester.setAttribute(el, $.host._.toolWidth, WIDTH).subscribe();
    });

    should(`render the width correctly on hover`, () => {
      tester.dispatchEvent(el, $.host._.onMouseOver, new CustomEvent('mouseover')).subscribe();

      assert(tester.getStyle(el, $.tool._.width)).to.emitWith(WIDTH);
    });

    should(`render 0 when not on hover`, () => {
      assert(tester.getStyle(el, $.tool._.width)).to.emitWith('0px');
    });
  });
});
