import { assert, match, setup, should, test } from '@gs-testing';
import { ImmutableSet } from '@gs-tools/collect';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { EMPTY } from '@rxjs';
import { switchMap, take } from '@rxjs/operators';
import { _p, _v } from '../app/app';
import { $, Backdrop } from './backdrop';
import { $dialogService, DialogService } from './dialog-service';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/section/backdrop', () => {
  let el: HTMLElement;
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

      assert(tester.getClassList(el, $.root)).to.emitWith(
          match.anyIterableThat<string, Set<string>>().haveElements(['isVisible']),
      );
    });

    should(`render correctly when dialog is not open`, () => {
      assert(tester.getClassList(el, $.root)).to.emitWith(
          match.anyIterableThat<string, Set<string>>().beEmpty(),
      );
    });
  });
});
