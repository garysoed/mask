import { VineImpl } from 'grapevine/export/main';
import { assert, retryUntil, setup, should, test } from 'gs-testing/export/main';
import { FakeFetch } from 'gs-testing/export/mock';
import { createSpySubject } from 'gs-testing/export/spy';
import { createImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, icon, Icon } from './icon';

const SVG_NAME = 'svgName';
const SVG_URL = 'http://svgUrl';

const {configure} = icon(
    createImmutableMap([[SVG_NAME, {type: 'remote' as 'remote', url: SVG_URL}]]),
);
const configureIcon = configure;
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.Icon', () => {
  const SVG_CONTENT = 'svgContent';

  let el: HTMLElement;
  let vine: VineImpl;
  let tester: PersonaTester;
  let fakeFetch: FakeFetch;

  setup(() => {
    tester = testerFactory.build([Icon]);
    vine = tester.vine;

    // TODO: Move configure to customElement annotation
    configureIcon(vine);

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
