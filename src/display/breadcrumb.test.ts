import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableList } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { $, breadcrumb } from './breadcrumb';
import { BREADCRUMB_CLICK_EVENT, BreadcrumbClickEvent } from './breadcrumb-event';

const config = breadcrumb();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.Breadcrumb', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([
      config.tag,
      config.dependencies[0].tag,
    ]);
    el = tester.createElement('mk-breadcrumb', document.body);
  });

  test('onRowAction_', () => {
    should(`dispatch the correct event`, async () => {
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

      await tester.setAttribute_(el, $.host.path, data);

      const handler = createSpy('Handler');
      el.addEventListener(BREADCRUMB_CLICK_EVENT, handler);

      const element = tester.getElementsAfter(el, $.row.crumbsSlot).get(0) as HTMLElement;
      element.click();

      const eventMatcher = match.anyObjectThat<BreadcrumbClickEvent>()
          .beAnInstanceOf(BreadcrumbClickEvent);
      assert(handler).to.haveBeenCalledWith(eventMatcher);
      assert(eventMatcher.getLastMatch().crumbKey).to.equal('a');
    });
  });

  test('renderCrumbs_', () => {
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

      await tester.setAttribute_(el, $.host.path, data);

      const elements = tester.getElementsAfter(el, $.row.crumbsSlot).slice(0, 3) as
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
