import { assert, setup, should, test } from 'gs-testing/export/main';
import { NumberType } from 'gs-types/export';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, dialog } from './dialog';
import { $dialogService, DialogService } from './dialog-service';

const config = dialog();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('section.Dialog', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([config.tag]);
    el = tester.createElement('mk-dialog', document.body);
    tester.vine.setValue($dialogService, new DialogService());
  });

  test('renderRootClass_', () => {
    should(`render correctly when dialog is displayed`, () => {
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              closeHandler: () => 123,
              elementProvider: () => document.createElement('div'),
              type: NumberType,
            });
          });

      assert(tester.getClassList(el, $.root.classlist)).to.haveElements(['isVisible']);
    });

    should(`render correctly when dialog is hidden`, () => {
      assert([...tester.getClassList(el, $.root.classlist)]).to.haveExactElements([]);
    });
  });
});
