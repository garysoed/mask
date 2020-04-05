import { assert, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, Drawer, Mode } from './drawer';


const testerFactory = new PersonaTesterFactory(_p);

test('section.Drawer', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Drawer]);
    const el = tester.createElement('mk-drawer', document.body);

    return {el};
  });

  test('renderStyleHeight_', () => {
    should(`render the max size if horizontal and expanded`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, Mode.HORIZONTAL));
      run(_.el.setAttribute($.host._.maxSize, size));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.host._.styleHeight)).to.emitWith(size);
    });

    should(`render the min size if horizontal and collapsed`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, Mode.HORIZONTAL));
      run(_.el.setAttribute($.host._.minSize, size));
      run(_.el.setAttribute($.host._.expanded, false));

      assert(_.el.getStyle($.host._.styleHeight)).to.emitWith(size);
    });

    should(`render '' if vertical`, () => {
      run(_.el.setAttribute($.host._.mode, Mode.VERTICAL));
      run(_.el.setAttribute($.host._.minSize, '123px'));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.host._.styleHeight)).to.emitWith('');
    });
  });

  test('renderStyleWidth_', () => {
    should(`render the max size if vertical and expanded`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, Mode.VERTICAL));
      run(_.el.setAttribute($.host._.maxSize, size));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.host._.styleWidth)).to.emitWith(size);
    });

    should(`render the min size if vertical and collapsed`, () => {
      const size = '123px';
      run(_.el.setAttribute($.host._.mode, Mode.VERTICAL));
      run(_.el.setAttribute($.host._.minSize, size));
      run(_.el.setAttribute($.host._.expanded, false));

      assert(_.el.getStyle($.host._.styleWidth)).to.emitWith(size);
    });

    should(`render '' if horizontal`, () => {
      run(_.el.setAttribute($.host._.mode, Mode.HORIZONTAL));
      run(_.el.setAttribute($.host._.minSize, '123px'));
      run(_.el.setAttribute($.host._.expanded, true));

      assert(_.el.getStyle($.host._.styleWidth)).to.emitWith('');
    });
  });
});
