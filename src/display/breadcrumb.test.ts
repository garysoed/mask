import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableList } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { filter, take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, Breadcrumb } from './breadcrumb';
import { BREADCRUMB_CLICK_EVENT, BreadcrumbClickEvent } from './breadcrumb-event';
import { Crumb } from './crumb';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.Breadcrumb', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([
      Breadcrumb,
      // TODO: Move dependencies to customElement annotation
      Crumb,
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

      const handler = createSpy('Handler');
      el.addEventListener(BREADCRUMB_CLICK_EVENT, handler);

      tester.setAttribute(el, $.host._.path, data).subscribe();

      // Wait until all the crumbs are rendered.
      const childrenNodes = await tester.getNodesAfter(el, $.row._.crumbsSlot)
          .pipe(
              filter(children => children.size() >= 3),
              take(1),
          )
          .toPromise();
      (childrenNodes.get(0) as HTMLElement).click();

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

      const handler = createSpy('Handler');
      el.addEventListener(BREADCRUMB_CLICK_EVENT, handler);

      tester.setAttribute(el, $.host._.path, data).subscribe();

      // Wait until all the crumbs are rendered.
      const childrenNodes = await tester.getNodesAfter(el, $.row._.crumbsSlot)
          .pipe(
              filter(children => children.size() >= 3),
              take(1),
          )
          .toPromise();

      const elements = childrenNodes
          .filterItem((item): item is HTMLElement => item instanceof HTMLElement);

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
