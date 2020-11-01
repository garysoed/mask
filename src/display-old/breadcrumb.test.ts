import { PersonaTesterFactory } from 'persona/export/testing';
import { assert, createSpySubject, objectThat, should, test } from 'gs-testing';
import { fromEvent } from 'rxjs';

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
    should('dispatch the correct event', () => {
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

      _.el.setAttribute($.host._.path, data);

      // Wait until all the crumbs are rendered.
      const childrenNodes = _.el.getNodesAfter($.row._.crumbsSlot);
      (childrenNodes![0] as HTMLElement).click();

      const eventMatcher = objectThat<BreadcrumbClickEvent>()
          .beAnInstanceOf(BreadcrumbClickEvent);
      assert(actionSubject).to.emitWith(eventMatcher);
      assert(eventMatcher.getLastMatch().crumbKey).to.equal('a');
    });
  });

  test('renderCrumbs', () => {
    should('render the crumbs correctly', () => {
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

      _.el.setAttribute($.host._.path, data);

      // Wait until all the crumbs are rendered.
      const nodes = _.el.getNodesAfter($.row._.crumbsSlot);
      const elements = nodes.filter((item): item is HTMLElement => item instanceof HTMLElement);

      assert(elements.map(el => el.tagName.toLowerCase())).to.haveExactElements([
        'mk-crumb',
        'mk-crumb',
        'mk-crumb',
      ]);
      assert(elements.map(el => el.getAttribute('display'))).to.haveExactElements([
        'displayA',
        'displayB',
        'displayC',
      ]);
      assert(elements.map(el => el.getAttribute('key'))).to.haveExactElements([
        'a',
        'b',
        'c',
      ]);
    });
  });
});
