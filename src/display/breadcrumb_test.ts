import { assert, match, should } from 'gs-testing/export/main';
import { ImmutableList } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { $, breadcrumb } from './breadcrumb';

const {ctor} = breadcrumb();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

describe('display.Breadcrumb', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([ctor]);
    el = tester.createElement('mk-breadcrumb', document.body);
  });

  describe('renderCrumbs_', () => {
    should(`render the crumbs correctly`, async () => {
      const data = ImmutableList.of([
        {
          display: 'displayA',
          key: 'a',
        },
        {
          display: 'displayB',
          key: 'b',
        },
        {
          display: 'displayC',
          key: 'c',
        },
      ]);

      await tester.setAttribute(el, $.host.path, data);

      const elements = tester.getElementsAfter(el, $.row.crumbs).slice(0, 3) as
          ImmutableList<HTMLElement>;

      assert(elements.mapItem(el => el.tagName.toLowerCase())).to.equal(
          match.anyIterableThat<string>().haveElements([
            'mk-crumb',
            'mk-crumb',
            'mk-crumb',
          ]),
      );
      assert(elements.mapItem(el => el.getAttribute('display'))).to.equal(
          match.anyIterableThat<string>().haveElements([
            'displayA',
            'displayB',
            'displayC',
          ]),
      );
      assert(elements.mapItem(el => el.getAttribute('key'))).to.equal(
          match.anyIterableThat<string>().haveElements([
            'a',
            'b',
            'c',
          ]),
      );
    });
  });
});
