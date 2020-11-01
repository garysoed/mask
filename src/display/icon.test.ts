import { $innerHtmlParseService, InnerHtmlParseService } from 'persona';
import { FakeFetch, assert, createSpyInstance, fake, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { ReplaySubject } from 'rxjs';

import { _p } from '../app/app';
import { registerSvg } from '../core/svg-service';

import { $, $icon, FitTo, Icon } from './icon';


const SVG_NAME = 'svgName';
const SVG_URL = 'http://svgUrl';

const testerFactory = new PersonaTesterFactory(_p);

test('display.Icon', init => {
  const SVG_CONTENT = 'svgContent';

  const _ = init(() => {
    const tester = testerFactory.build([Icon], document);
    registerSvg(tester.vine, SVG_NAME, {type: 'remote' as const, url: SVG_URL});

    const svgEl$ = new ReplaySubject<Element>(1);
    const mockInnerHtmlParseService = createSpyInstance(InnerHtmlParseService);
    fake(mockInnerHtmlParseService.parse).always().return(svgEl$);
    $innerHtmlParseService.set(tester.vine, () => mockInnerHtmlParseService);

    const fakeFetch = new FakeFetch();
    fakeFetch.onGet(SVG_URL).text(SVG_CONTENT);
    fakeFetch.install(window);

    const el = tester.createElement($icon.tag);

    return {el, mockInnerHtmlParseService, svgEl$, tester, fakeFetch};
  });

  test('rootSvg$', () => {
    should('set the innerHTML correctly and set the height to auto', () => {
      const svgEl = document.createElement('svg');
      svgEl.setAttribute('width', '123');
      _.svgEl$.next(svgEl);

      _.el.setAttribute($.host._.fitTo, FitTo.HEIGHT);
      _.el.setAttribute($.host._.icon, SVG_NAME);

      assert(_.el.getElement($.root).children.item(0)!.tagName).to.equal('SVG');
      assert(_.mockInnerHtmlParseService.parse).to.haveBeenCalledWith(SVG_CONTENT, 'image/svg+xml');

      assert(_.el.getElement($.root).children.item(0)!.hasAttribute('width')).to.equal(false);
      assert(_.el.getElement($.root).children.item(0)!.getAttribute('height')).to.equal('auto');
    });

    should('set the innerHTML correctly and set the width to auto', () => {
      const svgEl = document.createElement('svg');
      svgEl.setAttribute('height', '123');
      _.svgEl$.next(svgEl);

      _.el.setAttribute($.host._.fitTo, FitTo.WIDTH);
      _.el.setAttribute($.host._.icon, SVG_NAME);

      assert(_.el.getElement($.root).children.item(0)!.tagName).to.equal('SVG');
      assert(_.mockInnerHtmlParseService.parse).to.haveBeenCalledWith(SVG_CONTENT, 'image/svg+xml');

      assert(_.el.getElement($.root).children.item(0)!.hasAttribute('height')).to.equal(false);
      assert(_.el.getElement($.root).children.item(0)!.getAttribute('width')).to.equal('auto');
    });

    should('set the innerHTML correctly if there are no SVG names specified', () => {
      assert(_.el.getElement($.root).children.length).to.equal(0);
    });
  });
});
