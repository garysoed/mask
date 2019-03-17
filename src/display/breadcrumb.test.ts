import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
import { $filter, $head, $map, $pipe, $size, createImmutableList } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent } from 'rxjs';
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
      const data = createImmutableList([
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

      const actionSubject = createSpySubject();
      fromEvent(el, BREADCRUMB_CLICK_EVENT).subscribe(actionSubject);

      tester.setAttribute(el, $.host._.path, data).subscribe();

      // Wait until all the crumbs are rendered.
      const childrenNodes = await tester.getNodesAfter(el, $.row._.crumbsSlot)
          .pipe(
              filter(children => $pipe(children, $size()) >= 3),
              take(1),
          )
          .toPromise();
      ($pipe(childrenNodes, $head()) as HTMLElement).click();

      const eventMatcher = match.anyObjectThat<BreadcrumbClickEvent>()
          .beAnInstanceOf(BreadcrumbClickEvent);
      await assert(actionSubject).to.emitWith(eventMatcher);
      assert(eventMatcher.getLastMatch().crumbKey).to.equal('a');
    });
  });

  test('renderCrumbs_', () => {
    should(`render the crumbs correctly`, async () => {
      const data = createImmutableList([
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

      tester.setAttribute(el, $.host._.path, data).subscribe();

      // Wait until all the crumbs are rendered.
      const childrenNodes = await tester.getNodesAfter(el, $.row._.crumbsSlot)
          .pipe(
              filter(children => $pipe(children, $size()) >= 3),
              take(1),
          )
          .toPromise();

      const elements = $pipe(
          childrenNodes,
          $filter((item): item is HTMLElement => item instanceof HTMLElement),
      );

      assert([...$pipe(elements, $map(el => el.tagName.toLowerCase()))()]).to.haveExactElements([
        'mk-crumb',
        'mk-crumb',
        'mk-crumb',
      ]);
      assert([...$pipe(elements, $map(el => el.getAttribute('display')))()]).to.haveExactElements([
        'displayA',
        'displayB',
        'displayC',
      ]);
      assert([...$pipe(elements, $map(el => el.getAttribute('key')))()]).to.haveExactElements([
        'a',
        'b',
        'c',
      ]);
    });
  });
});
