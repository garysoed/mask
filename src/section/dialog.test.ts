import { assert, match, setup, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableMap, ImmutableSet } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { textIconButton } from '../component/text-icon-button';
import { icon } from '../display/icon';
import { iconWithText } from '../display/icon-with-text';
import { backdrop } from './backdrop';
import { $, dialog } from './dialog';
import { $dialogService, $dialogState, DialogService, DialogState } from './dialog-service';

const config = dialog(backdrop(), textIconButton(iconWithText(icon(ImmutableMap.of()))));
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('section.Dialog', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([config.tag]);
    el = tester.createElement('mk-dialog', document.body);
    tester.vine.setValue($dialogService, new DialogService());
  });

  test('onCancelButtonAction_', () => {
    should(`close the dialog correctly`, () => {
      const mockOnClose = createSpy('OnClose');
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: true,
              elementProvider: () => document.createElement('div'),
              onClose: mockOnClose,
              title: 'title',
            });
          });

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      tester.vine.getObservable($dialogState).subscribe(stateSubject);

      tester.getElement(el, $.cancelButton)
          .pipe(take(1))
          .subscribe(el => el.click());

      assert(mockOnClose).to.haveBeenCalledWith(true);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });
  });

  test('onOkButtonAction_', () => {
    should(`close the dialog correctly`, () => {
      const mockOnClose = createSpy('OnClose');
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: true,
              elementProvider: () => document.createElement('div'),
              onClose: mockOnClose,
              title: 'title',
            });
          });

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      tester.vine.getObservable($dialogState).subscribe(stateSubject);

      tester.getElement(el, $.okButton)
          .pipe(take(1))
          .subscribe(el => el.click());

      assert(mockOnClose).to.haveBeenCalledWith(false);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });
  });

  test('renderCancelButtonClasses_', () => {
    should(`display the cancel button if cancelable`, async () => {
      const mockOnClose = createSpy('OnClose');
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: true,
              elementProvider: () => document.createElement('div'),
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
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: false,
              elementProvider: () => document.createElement('div'),
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
      tester.vine.getObservable($dialogService)
          .pipe(take(1))
          .subscribe(dialogService => {
            dialogService.open<number>({
              cancelable: false,
              elementProvider: () => document.createElement('div'),
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
