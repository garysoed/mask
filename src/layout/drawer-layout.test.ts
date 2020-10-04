import { assert, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, $drawerLayout, DrawerLayout, DrawerMode } from './drawer-layout';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/layout/drawer-layout', init => {
  const _ = init(() => {
    const tester = testerFactory.build([DrawerLayout], document);
    const el = tester.createElement($drawerLayout.tag);

    return {el};
  });

  test('styleHeight$', () => {
    should(`render the max size if horizontal and expanded`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, DrawerMode.HORIZONTAL));
      run(_.el.setAttribute($.host._.maxSize, size));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.root._.styleHeight)).to.emitWith(size);
    });

    should(`render the min size if horizontal and collapsed`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, DrawerMode.HORIZONTAL));
      run(_.el.setAttribute($.host._.minSize, size));
      run(_.el.setAttribute($.host._.expanded, false));

      assert(_.el.getStyle($.root._.styleHeight)).to.emitWith(size);
    });

    should(`render '100%' if vertical`, () => {
      run(_.el.setAttribute($.host._.mode, DrawerMode.VERTICAL));
      run(_.el.setAttribute($.host._.minSize, '123px'));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.root._.styleHeight)).to.emitWith('100%');
    });
  });

  test('styleWidth$', () => {
    should(`render the max size if vertical and expanded`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, DrawerMode.VERTICAL));
      run(_.el.setAttribute($.host._.maxSize, size));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.root._.styleWidth)).to.emitWith(size);
    });

    should(`render the min size if vertical and collapsed`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, DrawerMode.VERTICAL));
      run(_.el.setAttribute($.host._.minSize, size));
      run(_.el.setAttribute($.host._.expanded, false));

      assert(_.el.getStyle($.root._.styleWidth)).to.emitWith(size);
    });

    should(`render '100%' if horizontal`, () => {
      run(_.el.setAttribute($.host._.mode, DrawerMode.HORIZONTAL));
      run(_.el.setAttribute($.host._.minSize, '123px'));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.root._.styleWidth)).to.emitWith('100%');
    });
  });
});
