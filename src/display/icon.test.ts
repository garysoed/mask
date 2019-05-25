import { assert, FakeFetch, runEnvironment, setup, should, test } from '@gs-testing';
import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { PersonaTester, PersonaTesterEnvironment, PersonaTesterFactory } from '@persona/testing';
import { map, take } from '@rxjs/operators';
import { _p } from '../app/app';
import { $, Icon } from './icon';
import { SvgConfig } from './svg-config';
import { $svgConfig } from './svg-service';

const SVG_NAME = 'svgName';
const SVG_URL = 'http://svgUrl';

const testerFactory = new PersonaTesterFactory(_p);

test('display.Icon', () => {
  runEnvironment(new PersonaTesterEnvironment());

  const SVG_CONTENT = 'svgContent';

  let el: HTMLElement;
  let tester: PersonaTester;
  let fakeFetch: FakeFetch;

  setup(() => {
    tester = testerFactory.build([Icon]);
    const svgSbj = $svgConfig.get(tester.vine);
    svgSbj
        .pipe(take(1))
        .subscribe(config => {
          const newConfig = $pipe(
              config,
              $push<[string, SvgConfig], string>(
                  [SVG_NAME, {type: 'remote' as 'remote', url: SVG_URL}],
              ),
              asImmutableMap(),
          );
          svgSbj.next(newConfig);
        });

    fakeFetch = new FakeFetch();
    fakeFetch.onGet(SVG_URL).text(SVG_CONTENT);
    fakeFetch.install(window);

    el = tester.createElement('mk-icon', document.body);
  });

  test('renderRootInnerHtml', () => {
    should(`set the innerHTML correctly`, () => {
      const svgContent = 'svgContent';

      tester.setAttribute(el, $.host._.icon, SVG_NAME).subscribe();

      assert(tester.getElement(el, $.root).pipe(map(el => el.innerHTML))).to.emitWith(svgContent);
    });

    should(`set the innerHTML correctly if there are no SVG names specified`, () => {
      assert(tester.getElement(el, $.root).pipe(map(el => el.innerHTML))).to.emitWith('');
    });
  });
});
