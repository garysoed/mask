import { assert, FakeFetch, run, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';

import { $, Icon } from './icon';
import { registerSvg } from './svg-service';


const SVG_NAME = 'svgName';
const SVG_URL = 'http://svgUrl';

const testerFactory = new PersonaTesterFactory(_p);

test('display.Icon', init => {
  const SVG_CONTENT = 'svgContent';

  const _ = init(() => {
    const tester = testerFactory.build([Icon], document);
    registerSvg(tester.vine, SVG_NAME, {type: 'remote' as 'remote', url: SVG_URL});

    const fakeFetch = new FakeFetch();
    fakeFetch.onGet(SVG_URL).text(SVG_CONTENT);
    fakeFetch.install(window);

    const el = tester.createElement('mk-icon');

    return {el, tester, fakeFetch};
  });

  test('renderRootInnerHtml', () => {
    should(`set the innerHTML correctly`, () => {
      const svgContent = 'svgContent';

      run(_.el.setAttribute($.host._.icon, SVG_NAME));

      assert(_.el.getElement($.root).pipe(map(el => el.innerHTML))).to.emitWith(svgContent);
    });

    should(`set the innerHTML correctly if there are no SVG names specified`, () => {
      assert(_.el.getElement($.root).pipe(map(el => el.innerHTML))).to.emitWith('');
    });
  });
});
