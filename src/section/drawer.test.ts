import { assert, runEnvironment, setup, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { _p } from '../app/app';
import { $, Drawer, Mode } from './drawer';

const testerFactory = new PersonaTesterFactory(_p);

test('section.Drawer', () => {
  runEnvironment(new PersonaTesterEnvironment());

  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Drawer]);
    el = tester.createElement('mk-drawer', document.body);
  });

  test('renderStyleHeight_', () => {
    should(`render the max size if horizontal and expanded`, () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.HORIZONTAL).subscribe();
      tester.setAttribute(el, $.host._.maxSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      assert(tester.getStyle(el, $.host._.styleHeight)).to.emitWith(size);
    });

    should(`render the min size if horizontal and collapsed`, () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.HORIZONTAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, false).subscribe();

      assert(tester.getStyle(el, $.host._.styleHeight)).to.emitWith(size);
    });

    should(`render '' if vertical`, () => {
      tester.setAttribute(el, $.host._.mode, Mode.VERTICAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, '123px').subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      assert(tester.getStyle(el, $.host._.styleHeight)).to.emitWith('');
    });
  });

  test('renderStyleWidth_', () => {
    should(`render the max size if vertical and expanded`, () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.VERTICAL).subscribe();
      tester.setAttribute(el, $.host._.maxSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      assert(tester.getStyle(el, $.host._.styleWidth)).to.emitWith(size);
    });

    should(`render the min size if vertical and collapsed`, () => {
      const size = '123px';
      tester.setAttribute(el, $.host._.mode, Mode.VERTICAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, size).subscribe();
      tester.setAttribute(el, $.host._.expanded, false).subscribe();

      assert(tester.getStyle(el, $.host._.styleWidth)).to.emitWith(size);
    });

    should(`render '' if horizontal`, () => {
      tester.setAttribute(el, $.host._.mode, Mode.HORIZONTAL).subscribe();
      tester.setAttribute(el, $.host._.minSize, '123px').subscribe();
      tester.setAttribute(el, $.host._.expanded, true).subscribe();

      assert(tester.getStyle(el, $.host._.styleWidth)).to.emitWith('');
    });
  });
});
