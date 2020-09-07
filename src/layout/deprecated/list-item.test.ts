// import { assert, run, should, test } from 'gs-testing';
// import { PersonaTesterFactory } from 'persona/export/testing';

// import { _p } from '../app/app';

// import { $, ListItem } from './list-item';


// const testerFactory = new PersonaTesterFactory(_p);

// test('mask.layout.ListItem', init => {
//   const _ = init(() => {
//     const tester = testerFactory.build([ListItem], document);
//     const el = tester.createElement('mk-list-item');
//     return {el, tester};
//   });

//   test('renderIconContainerDisplayed', () => {
//     should(`display if icon is specified`, () => {
//       run(_.el.setAttribute($.host._.icon, 'icon'));

//       assert(_.el.getHasClass($.iconContainer._.displayed)).to.emitWith(true);
//     });

//     should(`not display if icon is not specified`, () => {
//       run(_.el.setAttribute($.host._.icon, ''));

//       assert(_.el.getHasClass($.iconContainer._.displayed)).to.emitWith(false);
//     });
//   });

//   test('renderItemDetailContainerDisplayed', () => {
//     should(`display if item detail is specified`, () => {
//       run(_.el.setAttribute($.host._.itemDetail, 'itemDetail'));

//       assert(_.el.getHasClass($.itemDetailContainer._.displayed)).to.emitWith(true);
//     });

//     should(`not display if item detail is not specified`, () => {
//       run(_.el.setAttribute($.host._.itemDetail, ''));

//       assert(_.el.getHasClass($.itemDetailContainer._.displayed)).to.emitWith(false);
//     });
//   });

//   test('renderItemNameContainerDisplayed', () => {
//     should(`display if item name is specified`, () => {
//       run(_.el.setAttribute($.host._.itemName, 'itemName'));

//       assert(_.el.getHasClass($.itemNameContainer._.displayed)).to.emitWith(true);
//     });

//     should(`not display if item name is not specified`, () => {
//       run(_.el.setAttribute($.host._.itemName, ''));

//       assert(_.el.getHasClass($.itemNameContainer._.displayed)).to.emitWith(false);
//     });
//   });

//   test('renderToolWidth', _, init => {
//     const WIDTH = '20px';

//     init(_ => {
//       run(_.el.setAttribute($.host._.toolWidth, WIDTH));

//       return _;
//     });

//     should(`render the width correctly on hover`, () => {
//       run(_.el.dispatchEvent($.host._.onMouseOver, new CustomEvent('mouseover')));

//       assert(_.el.getStyle($.tool._.width)).to.emitWith(WIDTH);
//     });

//     should(`render 0 when not on hover`, () => {
//       assert(_.el.getStyle($.tool._.width)).to.emitWith('0px');
//     });
//   });
// });
