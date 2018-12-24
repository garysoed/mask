import { assert, setup, should, test } from 'gs-testing/export/main';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, backdrop } from './backdrop';
import { $dialogService, DialogService } from './dialog-service';

const config = backdrop();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('section.Backdrop', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([config.tag]);
    el = tester.createElement(config.tag, document.body);
    tester.vine.setValue($dialogService, new DialogService());
  });

  test('renderRootClasslist_', () => {
    should(`render correctly when dialog is open`, () => {
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: false,
              elementProvider: () => document.createElement('div'),
              onClose: () => undefined,
              title: 'title',
            });
          });

      assert(tester.getClassList_(el, $.root.classlist)).to.haveElements(['isVisible']);
    });

    should(`render correctly when dialog is not open`, () => {
      assert(tester.getClassList_(el, $.root.classlist)).to.beEmpty();
    });
  });
});
