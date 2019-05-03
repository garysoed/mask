
import { assert, createSpy, createSpySubject, match, setup, should, test } from '@gs-testing';
import { ImmutableSet } from '@gs-tools/collect';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { BehaviorSubject } from '@rxjs';
import { take } from '@rxjs/operators';
import { TextIconButton } from '../action/text-icon-button';
import { _p } from '../app/app';
import { $, Dialog } from './dialog';
import { $dialogService, $dialogState, DialogService, DialogState } from './dialog-service';

const testerFactory = new PersonaTesterFactory(_p);

test('section.Dialog', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Dialog, TextIconButton]);
    el = tester.createElement('mk-dialog', document.body);
    $dialogService.get(tester.vine).next(new DialogService());
  });

  test('onCloseOrCancel_', () => {
    should(`close the dialog correctly if canceled`, async () => {
      const onCloseSubject = createSpySubject<boolean>();
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open({
              cancelable: true,
              contentTag: 'div',
              onClose: v => onCloseSubject.next(v),
              title: 'title',
            });
          });

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      $dialogState.get(tester.vine).subscribe(stateSubject);

      tester.getElement(el, $.cancelButton)
          .pipe(take(1))
          .subscribe(el => el.click());

      await assert(onCloseSubject).to.emitWith(true);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });

    should(`close the dialog correctly if OK'd`, async () => {
      const onCloseSubject = createSpySubject<boolean>();
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open({
              cancelable: true,
              contentTag: 'div',
              onClose: v => onCloseSubject.next(v),
              title: 'title',
            });
          });

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      $dialogState.get(tester.vine).subscribe(stateSubject);

      tester.getElement(el, $.okButton)
          .pipe(take(1))
          .subscribe(el => el.click());

      await assert(onCloseSubject).to.emitWith(false);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });
  });

  test('renderCancelButtonClasses_', () => {
    should(`display the cancel button if cancelable`, async () => {
      const mockOnClose = createSpy('OnClose');
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open({
              cancelable: true,
              contentTag: 'div',
              onClose: mockOnClose,
              title: 'title',
            });
          });

      await assert(tester.getClassList(el, $.cancelButton)).to.emitWith(
          match.anyIterableThat<string, ImmutableSet<string>>().haveElements(['isVisible']),
      );
    });

    should(`not display the cancel button if not cancelable`, async () => {
      const mockOnClose = createSpy('OnClose');
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open({
              cancelable: false,
              contentTag: 'div',
              onClose: mockOnClose,
              title: 'title',
            });
          });

      await assert(tester.getClassList(el, $.cancelButton)).to.emitWith(
        match.anyIterableThat<string, ImmutableSet<string>>().beEmpty(),
      );
    });
  });

  test('renderRootClass_', () => {
    should(`render correctly when dialog is displayed`, async () => {
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open({
              cancelable: false,
              contentTag: 'div',
              onClose: () => undefined,
              title: 'title',
            });
          });

      await assert(tester.getClassList(el, $.root)).to.emitWith(
        match.anyIterableThat<string, ImmutableSet<string>>().haveElements(['isVisible']),
      );
    });

    should(`render correctly when dialog is hidden`, async () => {
      await assert(tester.getClassList(el, $.root)).to.emitWith(
        match.anyIterableThat<string, ImmutableSet<string>>().beEmpty(),
      );
    });
  });

  test('renderTitle_', () => {
    should(`render the title correctly`, async () => {
      const title = 'title';
      $dialogService.get(tester.vine)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open({
              cancelable: false,
              contentTag: 'div',
              onClose: () => undefined,
              title,
            });
          });

      await assert(tester.getTextContent(el, $.title)).to.emitWith(title);
    });

    should(`render empty string when dialog is hidden`, async () => {
      await assert(tester.getTextContent(el, $.title)).to.emitWith('');
    });
  });
});
