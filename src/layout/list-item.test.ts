import { assert, setup, should, test } from 'gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, ListItem } from './list-item';

const testerFactory = new PersonaTesterFactory(_p);

test('mask.layout.ListItem', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([ListItem]);
    el = tester.createElement('mk-list-item', document.body);
  });

  test('renderIconContainerDisplayed', () => {
    should(`display if icon is specified`, () => {
      el.setAttribute($.host._.icon, 'icon').subscribe();

      assert(el.getHasClass($.iconContainer._.displayed)).to.emitWith(true);
    });

    should(`not display if icon is not specified`, () => {
      el.setAttribute($.host._.icon, '').subscribe();

      assert(el.getHasClass($.iconContainer._.displayed)).to.emitWith(false);
    });
  });

  test('renderItemDetailContainerDisplayed', () => {
    should(`display if item detail is specified`, () => {
      el.setAttribute($.host._.itemDetail, 'itemDetail').subscribe();

      assert(el.getHasClass($.itemDetailContainer._.displayed)).to.emitWith(true);
    });

    should(`not display if item detail is not specified`, () => {
      el.setAttribute($.host._.itemDetail, '').subscribe();

      assert(el.getHasClass($.itemDetailContainer._.displayed)).to.emitWith(false);
    });
  });

  test('renderItemNameContainerDisplayed', () => {
    should(`display if item name is specified`, () => {
      el.setAttribute($.host._.itemName, 'itemName').subscribe();

      assert(el.getHasClass($.itemNameContainer._.displayed)).to.emitWith(true);
    });

    should(`not display if item name is not specified`, () => {
      el.setAttribute($.host._.itemName, '').subscribe();

      assert(el.getHasClass($.itemNameContainer._.displayed)).to.emitWith(false);
    });
  });

  test('renderToolWidth', () => {
    const WIDTH = '20px';

    setup(() => {
      el.setAttribute($.host._.toolWidth, WIDTH).subscribe();
    });

    should(`render the width correctly on hover`, () => {
      el.dispatchEvent($.host._.onMouseOver, new CustomEvent('mouseover')).subscribe();

      assert(el.getStyle($.tool._.width)).to.emitWith(WIDTH);
    });

    should(`render 0 when not on hover`, () => {
      assert(el.getStyle($.tool._.width)).to.emitWith('0px');
    });
  });
});
