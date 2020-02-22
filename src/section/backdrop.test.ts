import { assert, setThat, setup, should, test } from 'gs-testing';
import { ElementTester, PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { switchMap, take } from 'rxjs/operators';

import { _p } from '../app/app';

import { $, Backdrop } from './backdrop';
import { $dialogService, DialogService } from './dialog-service';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/section/backdrop', () => {
  let el: ElementTester;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Backdrop]);
    el = tester.createElement('mk-backdrop', document.body);
    $dialogService.get(tester.vine).next(new DialogService(tester.vine));
  });

  test('renderRootClasslist', () => {
    should(`render correctly when dialog is open`, () => {
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {tag: 'div'},
                title: 'title',
              })),
          )
          .subscribe();

      assert(el.getClassList($.root)).to.emitWith(
          setThat<string>().haveExactElements(new Set(['isVisible'])),
      );
    });

    should(`render correctly when dialog is not open`, () => {
      assert(el.getClassList($.root)).to.emitWith(setThat<string>().beEmpty());
    });
  });
});
