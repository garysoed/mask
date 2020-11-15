import {assert, should, test} from 'gs-testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';

import {$, $drawerLayout, DrawerLayout, DrawerMode} from './drawer-layout';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/layout/drawer-layout', init => {
  const _ = init(() => {
    const tester = testerFactory.build([DrawerLayout], document);
    const el = tester.createElement($drawerLayout.tag);

    return {el};
  });

  test('styleHeight$', () => {
    should('render the max size if horizontal and expanded', () => {
      const size = '123px';
      _.el.setAttribute($.host._.mode, DrawerMode.HORIZONTAL);
      _.el.setAttribute($.host._.maxSize, size);
      _.el.setAttribute($.host._.expanded, true);

      assert(_.el.getStyle($.root._.styleHeight)).to.equal(size);
    });

    should('render the min size if horizontal and collapsed', () => {
      const size = '123px';
      _.el.setAttribute($.host._.mode, DrawerMode.HORIZONTAL);
      _.el.setAttribute($.host._.minSize, size);
      _.el.setAttribute($.host._.expanded, false);

      assert(_.el.getStyle($.root._.styleHeight)).to.equal(size);
    });

    should('render \'100%\' if vertical', () => {
      _.el.setAttribute($.host._.mode, DrawerMode.VERTICAL);
      _.el.setAttribute($.host._.minSize, '123px');
      _.el.setAttribute($.host._.expanded, true);

      assert(_.el.getStyle($.root._.styleHeight)).to.equal('100%');
    });
  });

  test('styleWidth$', () => {
    should('render the max size if vertical and expanded', () => {
      const size = '123px';
      _.el.setAttribute($.host._.mode, DrawerMode.VERTICAL);
      _.el.setAttribute($.host._.maxSize, size);
      _.el.setAttribute($.host._.expanded, true);

      assert(_.el.getStyle($.root._.styleWidth)).to.equal(size);
    });

    should('render the min size if vertical and collapsed', () => {
      const size = '123px';
      _.el.setAttribute($.host._.mode, DrawerMode.VERTICAL);
      _.el.setAttribute($.host._.minSize, size);
      _.el.setAttribute($.host._.expanded, false);

      assert(_.el.getStyle($.root._.styleWidth)).to.equal(size);
    });

    should('render \'100%\' if horizontal', () => {
      _.el.setAttribute($.host._.mode, DrawerMode.HORIZONTAL);
      _.el.setAttribute($.host._.minSize, '123px');
      _.el.setAttribute($.host._.expanded, true);

      assert(_.el.getStyle($.root._.styleWidth)).to.equal('100%');
    });
  });
});
