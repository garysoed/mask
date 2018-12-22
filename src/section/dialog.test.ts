import { assert, setup, should, test } from 'gs-testing/export/main';
import { createSpy } from 'gs-testing/export/spy';
import { ImmutableMap } from 'gs-tools/export/collect';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { textIconButton } from '../component/text-icon-button';
import { icon } from '../display/icon';
import { iconWithText } from '../display/icon-with-text';
import { ActionEvent } from '../event/action-event';
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

      tester.getElement(el, $.cancelButton.el).click();

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

      tester.getElement(el, $.okButton.el).click();

      assert(mockOnClose).to.haveBeenCalledWith(false);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });
  });

  test('renderCancelButtonClasses_', () => {
    should(`display the cancel button if cancelable`, () => {
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

      assert(tester.getClassList(el, $.cancelButton.classlist)).to.haveElements(['isVisible']);
    });

    should(`not display the cancel button if not cancelable`, () => {
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

      assert(tester.getClassList(el, $.cancelButton.classlist)).to.beEmpty();
    });
  });

  test('renderRootClass_', () => {
    should(`render correctly when dialog is displayed`, () => {
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

      assert(tester.getClassList(el, $.root.classlist)).to.haveElements(['isVisible']);
    });

    should(`render correctly when dialog is hidden`, () => {
      assert([...tester.getClassList(el, $.root.classlist)]).to.haveExactElements([]);
    });
  });

  test('renderTitle_', () => {
    should(`render the title correctly`, () => {
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

      assert(tester.getTextContent(el, $.title.text)).to.equal(title);
    });

    should(`render empty string when dialog is hidden`, () => {
      assert(tester.getTextContent(el, $.title.text)).to.equal('');
    });
  });
});
