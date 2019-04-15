// import { assert, setup, should, test } from '@gs-testing/main';
// import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
// import { _p, _v } from '../app/app';
// import { $, ListItem } from './list-item';

// const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

// test('mask.layout.ListItem', () => {
//   let el: HTMLElement;
//   let tester: PersonaTester;

//   setup(() => {
//     tester = testerFactory.build([ListItem]);
//     el = tester.createElement('mk-list-item', document.body);
//   });

//   test('renderIconContainerDisplayed', () => {
//     should(`display if icon is specified`, async () => {
//       tester.setAttribute(el, $.host._.icon, 'icon').subscribe();

//       await assert(tester.getHasClass(el, $.iconContainer._.displayed)).to.emitWith(true);
//     });

//     should(`not display if icon is not specified`, async () => {
//       tester.setAttribute(el, $.host._.icon, '').subscribe();

//       await assert(tester.getHasClass(el, $.iconContainer._.displayed)).to.emitWith(false);
//     });
//   });

//   test('renderItemDetailContainerDisplayed', () => {
//     should(`display if item detail is specified`, async () => {
//       tester.setAttribute(el, $.host._.itemDetail, 'itemDetail').subscribe();

//       await assert(tester.getHasClass(el, $.itemDetailContainer._.displayed)).to.emitWith(true);
//     });

//     should(`not display if item detail is not specified`, async () => {
//       tester.setAttribute(el, $.host._.itemDetail, '').subscribe();

//       await assert(tester.getHasClass(el, $.itemDetailContainer._.displayed)).to.emitWith(false);
//     });
//   });

//   test('renderItemNameContainerDisplayed', () => {
//     should(`display if item name is specified`, async () => {
//       tester.setAttribute(el, $.host._.itemName, 'itemName').subscribe();

//       await assert(tester.getHasClass(el, $.itemNameContainer._.displayed)).to.emitWith(true);
//     });

//     should(`not display if item name is not specified`, async () => {
//       tester.setAttribute(el, $.host._.itemName, '').subscribe();

//       await assert(tester.getHasClass(el, $.itemNameContainer._.displayed)).to.emitWith(false);
//     });
//   });
// });
