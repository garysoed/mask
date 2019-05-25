
import { assert, createSpySubject, match, setup, should, test } from '@gs-testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { BehaviorSubject, EMPTY } from '@rxjs';
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
    should(`display the cancel button if cancelable`, () => {
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: true,
                content: {tag: 'div'},
                title: 'title',
              })),
          )
          .subscribe();

      assert(tester.getClassList(el, $.cancelButton)).to.emitWith(
          match.anyIterableThat<string, Set<string>>().haveElements(['isVisible']),
      );
    });

    should(`not display the cancel button if not cancelable`, () => {
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

      assert(tester.getClassList(el, $.cancelButton)).to.emitWith(
        match.anyIterableThat<string, Set<string>>().beEmpty(),
      );
    });
  });

  test('renderContent', () => {
    should(`render the content correctly`, () => {
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {
                  attr: new Map([['a', '1'], ['b', '2']]),
                  tag: 'mk-content',
                },
                title: 'title',
              })),
          )
          .subscribe();

      const nodeObs = tester.getNodesAfter(el, $.content._.single)
          .pipe(
              take(1),
              map(nodes => nodes[0] as HTMLElement),
          );
      assert(nodeObs.pipe(map(node => node.tagName))).to.emitWith('MK-CONTENT');
      assert(nodeObs.pipe(map(node => node.getAttribute('a')))).to.emitWith('1');
      assert(nodeObs.pipe(map(node => node.getAttribute('b')))).to.emitWith('2');
    });

    should(`render nothing if dialog is not open`, () => {
      const elementsObs = tester.getNodesAfter(el, $.content._.single)
          .pipe(map(nodes => nodes.filter(node => node.nodeType === Node.ELEMENT_NODE)));
      assert(elementsObs).to.emitWith(
          match.anyIterableThat<Node, Node[]>().beEmpty(),
      );
    });
  });

  test('renderRootClasses', () => {
    should(`render correctly when dialog is displayed`, () => {
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

    should(`render correctly when dialog is hidden`, () => {
      assert(tester.getClassList(el, $.root)).to.emitWith(
        match.anyIterableThat<string, Set<string>>().beEmpty(),
      );
    });
  });

  test('renderTitle', () => {
    should(`render the title correctly`, () => {
      const title = 'title';
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: false,
                content: {tag: 'div'},
                title,
              })),
          )
          .subscribe();

      assert(tester.getTextContent(el, $.title)).to.emitWith(title);
    });

    should(`render empty string when dialog is hidden`, () => {
      assert(tester.getTextContent(el, $.title)).to.emitWith('');
    });
  });

  test('setupOnCloseOrCancel', () => {
    should(`close the dialog correctly if canceled`, () => {
      const onCloseSubject = createSpySubject<boolean>();
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: true,
                content: {tag: 'div'},
                title: 'title',
              })),
          )
          .pipe(switchMap(({canceled}) => {
            onCloseSubject.next(canceled);

            return EMPTY;
          }))
          .subscribe();

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      $dialogState.get(tester.vine).subscribe(stateSubject);

      tester.getElement(el, $.cancelButton)
          .pipe(take(1))
          .subscribe(el => el.click());

      assert(onCloseSubject).to.emitWith(true);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });

    should(`close the dialog correctly if OK'd`, () => {
      const onCloseSubject = createSpySubject<boolean>();
      $dialogService.get(tester.vine)
          .pipe(
              take(1),
              switchMap(dialogService => dialogService.open({
                cancelable: true,
                content: {tag: 'div'},
                title: 'title',
              })),
          )
          .pipe(switchMap(({canceled}) => {
            onCloseSubject.next(canceled);

            return EMPTY;
          }))
          .subscribe();

      const stateSubject = new BehaviorSubject<DialogState|null>(null);
      $dialogState.get(tester.vine).subscribe(stateSubject);

      tester.dispatchEvent(el, $.okButton._.onAction, new ActionEvent()).subscribe();

      assert(onCloseSubject).to.emitWith(false);

      // tslint:disable-next-line:no-non-null-assertion
      assert(stateSubject.getValue()!.isOpen).to.beFalse();
    });
  });
});
