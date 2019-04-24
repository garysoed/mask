import { assert, match, setup, should, test } from '@gs-testing/main';
import { ImmutableSet } from '@gs-tools/collect';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, Backdrop } from './backdrop';
import { $dialogService, DialogService } from './dialog-service';

const testerFactory = new PersonaTesterFactory(_p);

test('section.Backdrop', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Backdrop]);
    el = tester.createElement('mk-backdrop', document.body);
    $dialogService.get(tester.vine).next(new DialogService());
  });

  test('renderRootClasslist_', () => {
    should(`render correctly when dialog is open`, async () => {
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: false,
              elementProvider: () => document.createElement('div'),
              onClose: () => undefined,
              title: 'title',
            });
          });

      await assert(tester.getClassList(el, $.root)).to.emitWith(
          match.anyIterableThat<string, ImmutableSet<string>>().haveElements(['isVisible']),
      );
    });

    should(`render correctly when dialog is not open`, async () => {
      await assert(tester.getClassList(el, $.root)).to.emitWith(
          match.anyIterableThat<string, ImmutableSet<string>>().beEmpty(),
      );
    });
  });
});
