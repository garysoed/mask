import { assert, setup, should, test } from 'gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';

import { _p } from '../app/app';

import { $, Drawer, Mode } from './drawer';

const testerFactory = new PersonaTesterFactory(_p);

test('section.Drawer', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Drawer]);
    el = tester.createElement('mk-drawer', document.body);
  });

  test('renderStyleHeight_', () => {
    should(`render the max size if horizontal and expanded`, () => {
      const size = '123px';
      el.setAttribute($.host._.mode, Mode.HORIZONTAL).subscribe();
      el.setAttribute($.host._.maxSize, size).subscribe();
      el.setAttribute($.host._.expanded, true).subscribe();

      assert(el.getStyle($.host._.styleHeight)).to.emitWith(size);
    });

    should(`render the min size if horizontal and collapsed`, () => {
      const size = '123px';
      el.setAttribute($.host._.mode, Mode.HORIZONTAL).subscribe();
      el.setAttribute($.host._.minSize, size).subscribe();
      el.setAttribute($.host._.expanded, false).subscribe();

      assert(el.getStyle($.host._.styleHeight)).to.emitWith(size);
    });

    should(`render '' if vertical`, () => {
      el.setAttribute($.host._.mode, Mode.VERTICAL).subscribe();
      el.setAttribute($.host._.minSize, '123px').subscribe();
      el.setAttribute($.host._.expanded, true).subscribe();

      assert(el.getStyle($.host._.styleHeight)).to.emitWith('');
    });
  });

  test('renderStyleWidth_', () => {
    should(`render the max size if vertical and expanded`, () => {
      const size = '123px';
      el.setAttribute($.host._.mode, Mode.VERTICAL).subscribe();
      el.setAttribute($.host._.maxSize, size).subscribe();
      el.setAttribute($.host._.expanded, true).subscribe();

      assert(el.getStyle($.host._.styleWidth)).to.emitWith(size);
    });

    should(`render the min size if vertical and collapsed`, () => {
      const size = '123px';
      el.setAttribute($.host._.mode, Mode.VERTICAL).subscribe();
      el.setAttribute($.host._.minSize, size).subscribe();
      el.setAttribute($.host._.expanded, false).subscribe();

      assert(el.getStyle($.host._.styleWidth)).to.emitWith(size);
    });

    should(`render '' if horizontal`, () => {
      el.setAttribute($.host._.mode, Mode.HORIZONTAL).subscribe();
      el.setAttribute($.host._.minSize, '123px').subscribe();
      el.setAttribute($.host._.expanded, true).subscribe();

      assert(el.getStyle($.host._.styleWidth)).to.emitWith('');
    });
  });
});
