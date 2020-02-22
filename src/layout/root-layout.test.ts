import { assert, FakeTime, mockTime, setup, should, test } from 'gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';

import { _p, _v } from '../app/app';

import { $, $qIsDesktop, RootLayout } from './root-layout';

const testerFactory = new PersonaTesterFactory(_p);

test('layout.RootLayout', () => {
  let el: ElementTester;
  let tester: PersonaTester;
  let fakeTime: FakeTime;

  setup(() => {
    fakeTime = mockTime(window);
    tester = testerFactory.build([RootLayout]);
    el = tester.createElement('mk-root-layout', document.body);
  });

  test('handleDrawerExpandCollapse', () => {
    should(`open the drawer if hovered`, () => {
      el.dispatchEvent($.drawer._.onMouseOver, new CustomEvent('mouseover')).subscribe();

      fakeTime.tick(100);

      assert(el.getAttribute($.drawer._.expanded)).to.emitWith(true);
      assert(el.getAttribute($.host._.drawerExpanded)).to.emitWith(true);
    });

    should(`collapse the drawer if not hovered and is not desktop`, () => {
      el.dispatchEvent($.drawer._.onMouseOver, new CustomEvent('mouseover')).subscribe();
      fakeTime.tick(100);

      assert(el.getAttribute($.drawer._.expanded)).to.emitWith(true);

      el.dispatchEvent($.drawer._.onMouseOut, new CustomEvent('mouseout')).subscribe();
      fakeTime.tick(100);

      assert(el.getAttribute($.drawer._.expanded)).to.emitWith(false);
      assert(el.getAttribute($.host._.drawerExpanded)).to.emitWith(false);
    });

    should(`open the drawer if destop sized`, () => {
      tester.setMedia($qIsDesktop, true);

      assert(el.getAttribute($.drawer._.expanded)).to.emitWith(true);
      assert(el.getAttribute($.host._.drawerExpanded)).to.emitWith(true);
    });
  });
});
