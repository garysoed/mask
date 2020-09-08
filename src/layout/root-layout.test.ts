import { assert, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, $qIsDesktop, RootLayout } from './root-layout';


const testerFactory = new PersonaTesterFactory(_p);

test('layout.RootLayout', init => {
  const _ = init(() => {
    const tester = testerFactory.build([RootLayout], document);
    const el = tester.createElement('mk-root-layout');
    return {el, tester};
  });

  test('handleDrawerExpandCollapse', () => {
    should(`open the drawer if hovered`, () => {
      run(_.el.dispatchEvent($.drawer._.onMouseEnter, new CustomEvent('mouseenter')));


      assert(_.el.getAttribute($.drawer._.expanded)).to.emitWith(true);
      assert(_.el.getAttribute($.host._.drawerExpanded)).to.emitWith(true);
    });

    should(`collapse the drawer if not hovered and is not desktop`, () => {
      run(_.el.dispatchEvent($.drawer._.onMouseEnter, new CustomEvent('mouseenter')));

      assert(_.el.getAttribute($.drawer._.expanded)).to.emitWith(true);

      run(_.el.dispatchEvent($.drawer._.onMouseLeave, new CustomEvent('mouseleave')));

      assert(_.el.getAttribute($.drawer._.expanded)).to.emitWith(false);
      assert(_.el.getAttribute($.host._.drawerExpanded)).to.emitWith(false);
    });

    should(`open the drawer if destop sized`, () => {
      _.tester.setMedia($qIsDesktop, true);

      assert(_.el.getAttribute($.drawer._.expanded)).to.emitWith(true);
      assert(_.el.getAttribute($.host._.drawerExpanded)).to.emitWith(true);
    });
  });
});
