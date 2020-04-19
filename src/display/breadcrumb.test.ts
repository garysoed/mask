import { assert, createSpySubject, objectThat, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { fromEvent, of as observableOf } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { _p } from '../app/app';

import { $, Breadcrumb } from './breadcrumb';
import { BREADCRUMB_CLICK_EVENT, BreadcrumbClickEvent } from './breadcrumb-event';


const testerFactory = new PersonaTesterFactory(_p);

test('display.Breadcrumb', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Breadcrumb], document);
    const el = tester.createElement('mk-breadcrumb');

    return {el, tester};
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

      const actionSubject = createSpySubject(fromEvent(_.el.element, BREADCRUMB_CLICK_EVENT));

      run(_.el.setAttribute($.host._.path, data));

      // Wait until all the crumbs are rendered.
      run(
          _.el.getNodesAfter($.row._.crumbsSlot)
              .pipe(tap(childrenNodes => (childrenNodes![0] as HTMLElement).click())),
      );

      const eventMatcher = objectThat<BreadcrumbClickEvent>()
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

      run(_.el.setAttribute($.host._.path, data));

      // Wait until all the crumbs are rendered.
      const elementsObs = _.el.getNodesAfter($.row._.crumbsSlot)
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
