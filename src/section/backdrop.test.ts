import { assert, run, setThat, should, test } from 'gs-testing';
import { PersonaTesterFactory } from 'persona/export/testing';
import { switchMap, take } from 'rxjs/operators';

import { _p } from '../app/app';

import { $, Backdrop } from './backdrop';
import { $dialogService, DialogService } from './dialog-service';


const testerFactory = new PersonaTesterFactory(_p);

test('@mask/section/backdrop', init => {
  const _ = init(() => {
    const tester = testerFactory.build([Backdrop]);
    const el = tester.createElement('mk-backdrop', document.body);
    $dialogService.get(tester.vine).next(new DialogService(tester.vine));

    return {el, tester};
  });

  test('renderRootClasslist', () => {
    should(`render correctly when dialog is open`, () => {
      run(
          $dialogService.get(_.tester.vine)
              .pipe(
                  take(1),
                  switchMap(dialogService => dialogService.open({
                    cancelable: false,
                    content: {tag: 'div'},
                    title: 'title',
                  })),
              ),
      );

      assert(_.el.getClassList($.root)).to.emitWith(
          setThat<string>().haveExactElements(new Set(['isVisible'])),
      );
    });

    should(`render correctly when dialog is not open`, () => {
      assert(_.el.getClassList($.root)).to.emitWith(setThat<string>().beEmpty());
    });
  });
});
