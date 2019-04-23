import { assert, retryUntil, setup, should, test } from '@gs-testing/main';
import { FakeFetch } from '@gs-testing/mock';
import { createSpySubject } from '@gs-testing/spy';
import { $pipe, $push, asImmutableMap } from '@gs-tools/collect';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, Icon } from './icon';
import { SvgConfig } from './svg-config';
import { $svgConfig } from './svg-service';

const SVG_NAME = 'svgName';
const SVG_URL = 'http://svgUrl';

const testerFactory = new PersonaTesterFactory(_p);

test('display.Icon', () => {
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

  test('renderRootInnerHtml_', () => {
    should(`set the innerHTML correctly`, async () => {
      const svgContent = 'svgContent';

      tester.setAttribute(el, $.host._.icon, SVG_NAME).pipe(take(1)).subscribe();

      const spySubject = createSpySubject<Element>();
      tester.getElement(el, $.root).subscribe(spySubject);
      await retryUntil(() => spySubject.getValue().innerHTML).to.equal(svgContent);
    });

    should(`set the innerHTML correctly if there are no SVG names specified`, () => {
      const spySubject = createSpySubject<Element>();
      tester.getElement(el, $.root).subscribe(spySubject);
      assert(spySubject.getValue().innerHTML).to.equal('');
    });
  });
});
