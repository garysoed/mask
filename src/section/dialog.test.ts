// import { arrayThat, assert, createSpySubject, run, setThat, should, test } from 'gs-testing';
// import { PersonaTesterFactory } from 'persona/export/testing';
// import { map, switchMap, take, tap } from 'rxjs/operators';

// import { TextIconButton } from '../action/deprecated/text-icon-button';
// import { _p } from '../app/app';
// import { ActionEvent } from '../event/action-event';

// import { $, Dialog } from './dialog';
// import { $dialogService, $dialogState, DialogService } from './dialog-service';


// const testerFactory = new PersonaTesterFactory(_p);

// test('@mask/section/dialog', init => {
//   const _ = init(() => {
//     const tester = testerFactory.build([Dialog, TextIconButton], document);
//     const el = tester.createElement('mk-dialog');
//     $dialogService.set(tester.vine, () => new DialogService(tester.vine));

//     return {el, tester};
//   });

//   test('renderCancelButtonClasses', () => {
//     should(`display the cancel button if cancelable`, () => {
//       run(
//           $dialogService.get(_.tester.vine)
//               .pipe(
//                   take(1),
//                   switchMap(dialogService => dialogService.open({
//                     cancelable: true,
//                     content: {tag: 'div'},
//                     title: 'title',
//                   })),
//               ),
//       );

//       assert(_.el.getClassList($.cancelButton)).to.emitWith(
//           setThat<string>().haveExactElements(new Set(['isVisible'])),
//       );
//     });

//     should(`not display the cancel button if not cancelable`, () => {
//       run(
//           $dialogService.get(_.tester.vine)
//               .pipe(
//                   take(1),
//                   switchMap(dialogService => dialogService.open({
//                     cancelable: false,
//                     content: {tag: 'div'},
//                     title: 'title',
//                   })),
//               ),
//       );

//       assert(_.el.getClassList($.cancelButton)).to.emitWith(setThat<string>().beEmpty());
//     });
//   });

//   test('renderContent', () => {
//     should(`render the content correctly`, () => {
//       run(
//           $dialogService.get(_.tester.vine)
//               .pipe(
//                   take(1),
//                   switchMap(dialogService => dialogService.open({
//                     cancelable: false,
//                     content: {
//                       attr: new Map([['a', '1'], ['b', '2']]),
//                       tag: 'mk-content',
//                     },
//                     title: 'title',
//                   })),
//               ),
//       );

//       const nodeObs = _.el.getNodesAfter($.content._.single)
//           .pipe(
//               take(1),
//               map(nodes => nodes[0] as HTMLElement),
//           );
//       assert(nodeObs.pipe(map(node => node.tagName))).to.emitWith('MK-CONTENT');
//       assert(nodeObs.pipe(map(node => node.getAttribute('a')))).to.emitWith('1');
//       assert(nodeObs.pipe(map(node => node.getAttribute('b')))).to.emitWith('2');
//     });

//     should(`render nothing if dialog is not open`, () => {
//       const elementsObs = _.el.getNodesAfter($.content._.single)
//           .pipe(map(nodes => nodes.filter(node => node.nodeType === Node.ELEMENT_NODE)));
//       assert(elementsObs).to.emitWith(arrayThat<Node>().beEmpty());
//     });
//   });

//   test('renderRootClasses', () => {
//     should(`render correctly when dialog is displayed`, () => {
//       run(
//           $dialogService.get(_.tester.vine)
//               .pipe(
//                   take(1),
//                   switchMap(dialogService => dialogService.open({
//                     cancelable: false,
//                     content: {tag: 'div'},
//                     title: 'title',
//                   })),
//               ),
//       );

//       assert(_.el.getClassList($.root)).to.emitWith(
//         setThat<string>().haveExactElements(new Set(['isVisible'])),
//       );
//     });

//     should(`render correctly when dialog is hidden`, () => {
//       assert(_.el.getClassList($.root)).to.emitWith(
//         setThat<string>().beEmpty(),
//       );
//     });
//   });

//   test('renderTitle', () => {
//     should(`render the title correctly`, () => {
//       const title = 'title';
//       run(
//           $dialogService.get(_.tester.vine)
//               .pipe(
//                   take(1),
//                   switchMap(dialogService => dialogService.open({
//                     cancelable: false,
//                     content: {tag: 'div'},
//                     title,
//                   })),
//               ),
//       );

//       assert(_.el.getTextContent($.title)).to.emitWith(title);
//     });

//     should(`render empty string when dialog is hidden`, () => {
//       assert(_.el.getTextContent($.title)).to.emitWith('');
//     });
//   });

//   test('setupOnCloseOrCancel', () => {
//     should(`close the dialog correctly if canceled`, () => {
//       const onOpen$ = $dialogService.get(_.tester.vine)
//           .pipe(
//               take(1),
//               switchMap(dialogService => dialogService.open({
//                 cancelable: true,
//                 content: {tag: 'div'},
//                 title: 'title',
//               })),
//               map(({canceled}) => canceled),
//           );
//       const onCloseSubject = createSpySubject<boolean>(onOpen$);

//       const stateSubject = createSpySubject($dialogState.get(_.tester.vine));

//       run(
//           _.el.getElement($.cancelButton)
//               .pipe(
//                   take(1),
//                   tap(el => {
//                     el.click();
//                   }),
//               ),
//       );

//       assert(onCloseSubject).to.emitWith(true);

//       assert(stateSubject.pipe(map(({isOpen}) => isOpen))).to.emitWith(false);
//     });

//     should(`close the dialog correctly if OK'd`, () => {
//       const onOpen$ = $dialogService.get(_.tester.vine)
//           .pipe(
//               take(1),
//               switchMap(dialogService => dialogService.open({
//                 cancelable: true,
//                 content: {tag: 'div'},
//                 title: 'title',
//               })),
//               map(({canceled}) => canceled),
//           );
//       const onCloseSubject = createSpySubject<boolean>(onOpen$);

//       const stateSubject = createSpySubject($dialogState.get(_.tester.vine));

//       run(_.el.dispatchEvent($.okButton._.onAction, new ActionEvent(undefined)));

//       assert(onCloseSubject).to.emitWith(false);
//       assert(stateSubject.pipe(map(({isOpen}) => isOpen))).to.emitWith(false);
//     });
//   });
// });
