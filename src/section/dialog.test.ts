
import { assert, createSpy, createSpySubject, match, setup, should, test } from '@gs-testing';
import { $pipe, ImmutableSet } from '@gs-tools/collect';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { BehaviorSubject, EMPTY, Observable } from '@rxjs';
import { map, switchMap, take } from '@rxjs/operators';
import { TextIconButton } from '../action/text-icon-button';
import { _p } from '../app/app';
import { ActionEvent } from '../event/action-event';
import { $, Dialog } from './dialog';
import { $dialogService, $dialogState, DialogService, DialogState } from './dialog-service';

const testerFactory = new PersonaTesterFactory(_p);

test('@mask/section/dialog', () => {
  let el: HTMLElement;
  let tester: PersonaTester;

  setup(() => {
    tester = testerFactory.build([Dialog, TextIconButton]);
    el = tester.createElement('mk-dialog', document.body);
    $dialogService.get(tester.vine).next(new DialogService(tester.vine));
  });

  test('renderCancelButtonClasses', () => {
    should(`display the cancel button if cancelable`, async () => {
      const mockOnClose = createSpy<Observable<unknown>>('OnClose');
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: true,
                content: {tag: 'div'},
                onClose: mockOnClose,
                title: 'title',
              })),
          )
          .subscribe();

      await assert(tester.getClassList(el, $.cancelButton)).to.emitWith(
          match.anyIterableThat<string, ImmutableSet<string>>().haveElements(['isVisible']),
      );
    });

    should(`not display the cancel button if not cancelable`, async () => {
      const mockOnClose = createSpy<Observable<unknown>>('OnClose');
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {tag: 'div'},
                onClose: mockOnClose,
                title: 'title',
              })),
          )
          .subscribe();

      await assert(tester.getClassList(el, $.cancelButton)).to.emitWith(
        match.anyIterableThat<string, ImmutableSet<string>>().beEmpty(),
      );
    });
  });

  test('renderContent', () => {
    should(`render the content correctly`, async () => {
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {
                  attr: new Map([['a', '1'], ['b', '2']]),
                  tag: 'mk-content',
                },
                onClose: () => EMPTY,
                title: 'title',
              })),
          )
          .subscribe();

      const node = await tester.getNodesAfter(el, $.content._.single)
          .pipe(
              take(1),
              map(nodes => nodes[0]),
          )
          .toPromise() as HTMLElement;
      assert(node.tagName).to.equal('MK-CONTENT');
      assert(node.getAttribute('a')).to.equal('1');
      assert(node.getAttribute('b')).to.equal('2');
    });

    should(`render nothing if dialog is not open`, async () => {
      const elementsObs = tester.getNodesAfter(el, $.content._.single)
          .pipe(map(nodes => nodes.filter(node => node.nodeType === Node.ELEMENT_NODE)));
      await assert(elementsObs).to.emitWith(
          match.anyIterableThat<Node, Node[]>().beEmpty(),
      );
    });
  });

  test('renderRootClasses', () => {
    should(`render correctly when dialog is displayed`, async () => {
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {tag: 'div'},
                onClose: () => EMPTY,
                title: 'title',
              })),
          )
          .subscribe();

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

  test('renderTitle', () => {
    should(`render the title correctly`, async () => {
      const title = 'title';
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {tag: 'div'},
                onClose: () => EMPTY,
                title,
              })),
          )
          .subscribe();

      await assert(tester.getTextContent(el, $.title)).to.emitWith(title);
    });

    should(`render empty string when dialog is hidden`, async () => {
      await assert(tester.getTextContent(el, $.title)).to.emitWith('');
    });
  });

  test('setupOnCloseOrCancel', () => {
    should(`close the dialog correctly if canceled`, async () => {
      const onCloseSubject = createSpySubject<boolean>();
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: true,
                content: {tag: 'div'},
                onClose: v => {
                  onCloseSubject.next(v);

                  return EMPTY;
                },
                title: 'title',
              })),
          )
          .subscribe();

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
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: true,
                content: {tag: 'div'},
                onClose: v => {
                  onCloseSubject.next(v);

                  return EMPTY;
                },
                title: 'title',
              })),
          )
          .subscribe();

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      $dialogState.get(tester.vine).subscribe(stateSubject);

      tester.dispatchEvent(el, $.okButton._.onAction, new ActionEvent()).subscribe();

      await assert(onCloseSubject).to.emitWith(false);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });
  });
});
