import { assert, setup, should, test } from '@gs-testing/main';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { _p, _v } from '../app/app';
import { $, $qIsDesktop, RootLayout } from './root-layout';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('layout.RootLayout', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([RootLayout]);
    el = tester.createElement('mk-root-layout', document.body);
  });

  test('handleDrawerExpandCollapse', () => {
    should(`open the drawer if hovered`, async () => {
      tester.dispatchEvent(el, $.drawer, new CustomEvent('mouseover')).subscribe();

      await assert(tester.getAttribute(el, $.drawer._.expanded)).to.emitWith(true);
      await assert(tester.getAttribute(el, $.host._.drawerExpanded)).to.emitWith(true);
    });

    should(`collapse the drawer if not hovered and is not desktop`, async () => {
      tester.dispatchEvent(el, $.drawer, new CustomEvent('mouseover')).subscribe();

      // Wait for the drawer to be expanded.
      await assert(tester.getAttribute(el, $.drawer._.expanded)).to.emitWith(true);

      tester.dispatchEvent(el, $.drawer, new CustomEvent('mouseout')).subscribe();
      await assert(tester.getAttribute(el, $.drawer._.expanded)).to.emitWith(false);
      await assert(tester.getAttribute(el, $.host._.drawerExpanded)).to.emitWith(false);
    });

    should(`open the drawer if destop sized`, async () => {
      tester.setMedia($qIsDesktop, true);

      await assert(tester.getAttribute(el, $.drawer._.expanded)).to.emitWith(true);
      await assert(tester.getAttribute(el, $.host._.drawerExpanded)).to.emitWith(true);
    });
  });
});
