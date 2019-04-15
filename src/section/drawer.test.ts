import { assert, setup, should, test } from '@gs-testing/main';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { _p, _v } from '../app/app';
import { $, Drawer, Mode } from './drawer';

const testerFactory = new PersonaTesterFactory(_v, _p);

test('section.Drawer', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Drawer]);
    el = tester.createElement('mk-drawer', document.body);
  });

  test('renderStyleHeight_', () => {
    should(`render the max size if horizontal and expanded`, async () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.HORIZONTAL).subscribe();
      tester.setAttribute(el, $.host._.maxSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      await assert(tester.getStyle(el, $.host._.styleHeight)).to.emitWith(size);
    });

    should(`render the min size if horizontal and collapsed`, async () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.HORIZONTAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, false).subscribe();

      await assert(tester.getStyle(el, $.host._.styleHeight)).to.emitWith(size);
    });

    should(`render '' if vertical`, async () => {
      tester.setAttribute(el, $.host._.mode, Mode.VERTICAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, '123px').subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      await assert(tester.getStyle(el, $.host._.styleHeight)).to.emitWith('');
    });
  });

  test('renderStyleWidth_', () => {
    should(`render the max size if vertical and expanded`, async () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.VERTICAL).subscribe();
      tester.setAttribute(el, $.host._.maxSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      await assert(tester.getStyle(el, $.host._.styleWidth)).to.emitWith(size);
    });

    should(`render the min size if vertical and collapsed`, async () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.VERTICAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, false).subscribe();

      await assert(tester.getStyle(el, $.host._.styleWidth)).to.emitWith(size);
    });

    should(`render '' if horizontal`, async () => {
      tester.setAttribute(el, $.host._.mode, Mode.HORIZONTAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, '123px').subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      await assert(tester.getStyle(el, $.host._.styleWidth)).to.emitWith('');
    });
  });
});
