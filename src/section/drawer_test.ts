import { assert, should } from 'gs-testing/export/main';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { persona_, vine_ } from '../app/app';
import { $, drawer, Mode } from './drawer';

const {ctor} = drawer();
const testerFactory = new PersonaTesterFactory(vine_.builder, persona_.builder);

describe('display.Drawer', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([ctor]);
    el = tester.createElement('mk-drawer', document.body);
  });

  describe('renderStyleHeight_', () => {
    should(`render the max size if horizontal and expanded`, async () => {
      const size = '123px';
      await tester.setAttribute(el, $.host.mode, Mode.HORIZONTAL);
      await tester.setAttribute(el, $.host.maxSize, size);
      await tester.setAttribute(el, $.host.expanded, true);

      assert(tester.getStyle(el, $.host.style.height)).to.equal(size);
    });

    should(`render the min size if horizontal and collapsed`, async () => {
      const size = '123px';
      await tester.setAttribute(el, $.host.mode, Mode.HORIZONTAL);
      await tester.setAttribute(el, $.host.minSize, size);
      await tester.setAttribute(el, $.host.expanded, false);

      assert(tester.getStyle(el, $.host.style.height)).to.equal(size);
    });

    should(`render '' if vertical`, async () => {
      await tester.setAttribute(el, $.host.mode, Mode.VERTICAL);
      await tester.setAttribute(el, $.host.minSize, '123px');
      await tester.setAttribute(el, $.host.expanded, true);

      assert(tester.getStyle(el, $.host.style.height)).to.equal('size');
    });
  });

  describe('renderStyleWidth_', () => {
    should(`render the max size if vertical and expanded`, async () => {
      const size = '123px';
      await tester.setAttribute(el, $.host.mode, Mode.VERTICAL);
      await tester.setAttribute(el, $.host.maxSize, size);
      await tester.setAttribute(el, $.host.expanded, true);

      assert(tester.getStyle(el, $.host.style.width)).to.equal(size);
    });

    should(`render the min size if vertical and collapsed`, async () => {
      const size = '123px';
      await tester.setAttribute(el, $.host.mode, Mode.VERTICAL);
      await tester.setAttribute(el, $.host.minSize, size);
      await tester.setAttribute(el, $.host.expanded, false);

      assert(tester.getStyle(el, $.host.style.width)).to.equal(size);
    });

    should(`render '' if horizontal`, async () => {
      const size = '123px';
      await tester.setAttribute(el, $.host.mode, Mode.HORIZONTAL);
      await tester.setAttribute(el, $.host.minSize, '123px');
      await tester.setAttribute(el, $.host.expanded, true);

      assert(tester.getStyle(el, $.host.style.width)).to.equal('size');
    });
  });
});
