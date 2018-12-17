import { VineImpl } from 'grapevine/export/main';
import { assert, setup, should, test } from 'gs-testing/export/main';
import { FakeFetch } from 'gs-testing/export/mock';
import { createSpyInstance, fake } from 'gs-testing/export/spy';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { $, icon } from './icon';

const SVG_NAME = 'svgName';
const SVG_URL = 'http://svgUrl';

const {configure, tag} = icon(ImmutableMap.of([[SVG_NAME, SVG_URL]]));
const configureIcon = configure;
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('display.Icon', () => {
  let el: HTMLElement;
  let vine: VineImpl;
  let tester: PersonaTester;
  let fakeFetch: FakeFetch;

  setup(() => {
    tester = testerFactory.build([tag]);
    vine = tester.vine;
    configureIcon(vine);

    fakeFetch = new FakeFetch();
    fakeFetch.install(window);

    el = tester.createElement('mk-icon', document.body);
  });

  test('init', () => {
    should(`set the innerHTML correctly`, async () => {
      const fakeResponse = createSpyInstance(Response);
      const svgContent = 'svgContent';

      const calledPromise = new Promise(resolve => {
        fake(fakeResponse.text).always().call(() => {
          resolve();

          return Promise.resolve(svgContent);
        });
      });

      fakeFetch.onGet(SVG_URL).respond(fakeResponse);

      el.textContent = SVG_NAME;

      await calledPromise;

      assert(tester.getElement(el, $.root.el).innerHTML).to.equal(svgContent);
    });

    should(`set the innerHTML correctly if there are no SVG names specified`, () => {
      assert(tester.getElement(el, $.root.el).innerHTML).to.equal('');
    });
  });
});
