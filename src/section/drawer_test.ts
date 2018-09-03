import { VineImpl } from 'grapevine/export/main';
import { retryUntil, should } from 'gs-testing/export/main';
import { PersonaTesterFactory } from 'persona/export/testing';
import { persona_, vine_ } from '../app/app';
import { drawer } from './drawer';

const {ctor} = drawer();
const testerFactory = new PersonaTesterFactory(vine_.builder, persona_.builder);

describe('display.Drawer', () => {
  let el: HTMLElement;
  let vine: VineImpl;

  beforeEach(() => {
    const tester = testerFactory.build([ctor]);
    vine = tester.vine;
    el = tester.createElement('mk-drawer');
    document.body.appendChild(el);
  });

  describe('renderStyleHeight_', () => {
    should(`render the max size if horizontal and expanded`, async () => {
      const size = '123px';
      el.setAttribute('mode', 'horizontal');
      el.setAttribute('max-size', size);
      el.setAttribute('expanded', 'true');

      await retryUntil(() => el.style.height).to.equal(size);
    });

    should(`render the min size if horizontal and collapsed`, async () => {
      const size = '123px';
      el.setAttribute('mode', 'horizontal');
      el.setAttribute('min-size', size);
      el.setAttribute('expanded', 'false');

      await retryUntil(() => el.style.height).to.equal(size);
    });

    should(`render '' if vertical`, async () => {
      el.setAttribute('mode', 'vertical');
      el.setAttribute('min-size', '123px');
      el.setAttribute('expanded', 'true');

      await retryUntil(() => el.style.height).to.equal('');
    });
  });

  describe('renderStyleWidth_', () => {
    should(`render the max size if vertical and expanded`, async () => {
      const size = '123px';
      el.setAttribute('mode', 'vertical');
      el.setAttribute('max-size', size);
      el.setAttribute('expanded', 'true');

      await retryUntil(() => el.style.width).to.equal(size);
    });

    should(`render the min size if vertical and collapsed`, async () => {
      const size = '123px';
      el.setAttribute('mode', 'vertical');
      el.setAttribute('min-size', size);
      el.setAttribute('expanded', 'false');

      await retryUntil(() => el.style.width).to.equal(size);
    });

    should(`render '' if horizontal`, async () => {
      el.setAttribute('mode', 'horizontal');
      el.setAttribute('min-size', '123px');
      el.setAttribute('expanded', 'true');

      await retryUntil(() => el.style.width).to.equal('');
    });
  });
});
