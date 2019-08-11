import { assert, createSpySubject, match, should, test } from '@gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { fromEvent, of as observableOf } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { _p } from '../app/app';

import { $, Breadcrumb } from './breadcrumb';
import { BREADCRUMB_CLICK_EVENT, BreadcrumbClickEvent } from './breadcrumb-event';


const testerFactory = new PersonaTesterFactory(_p);

test('display.Breadcrumb', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  beforeEach(() => {
    tester = testerFactory.build([
      Breadcrumb,
    ]);
    el = tester.createElement('mk-breadcrumb', document.body);
  });

  test('onRowAction', () => {
    should(`dispatch the correct event`, () => {
      const data = [
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
      ];

      const actionSubject = createSpySubject();
      fromEvent(el.element, BREADCRUMB_CLICK_EVENT).subscribe(actionSubject);

      el.setAttribute($.host._.path, data).subscribe();

      // Wait until all the crumbs are rendered.
      el.getNodesAfter($.row._.crumbsSlot)
          .subscribe(childrenNodes => (childrenNodes![0] as HTMLElement).click());

      const eventMatcher = match.anyObjectThat<BreadcrumbClickEvent>()
          .beAnInstanceOf(BreadcrumbClickEvent);
      assert(actionSubject).to.emitWith(eventMatcher);
      assert(eventMatcher.getLastMatch().crumbKey).to.equal('a');
    });
  });

  test('renderCrumbs_', () => {
    should(`render the crumbs correctly`, () => {
      const data = [
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
      ];

      el.setAttribute($.host._.path, data).subscribe();

      // Wait until all the crumbs are rendered.
      const elementsObs = el.getNodesAfter($.row._.crumbsSlot)
          .pipe(
              map(nodes => {
                return nodes.filter((item): item is HTMLElement => item instanceof HTMLElement);
              }),
              switchMap(els => observableOf(...els)),
          );

      assert(elementsObs.pipe(map(el => el.tagName.toLowerCase()))).to.emitSequence([
        'mk-crumb',
        'mk-crumb',
        'mk-crumb',
      ]);
      assert(elementsObs.pipe(map(el => el.getAttribute('display')))).to.emitSequence([
        'displayA',
        'displayB',
        'displayC',
      ]);
      assert(elementsObs.pipe(map(el => el.getAttribute('key')))).to.emitSequence([
        'a',
        'b',
        'c',
      ]);
    });
  });
});
