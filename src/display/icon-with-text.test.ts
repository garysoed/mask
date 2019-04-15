// import { match, retryUntil, setup, should, test } from '@gs-testing/main';
// import { createSpySubject } from '@gs-testing/spy';
// import { ImmutableSet } from '@gs-tools/collect';
// import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
// import { combineLatest } from 'rxjs';
// import { take } from 'rxjs/operators';
// import { _p, _v } from '../app/app';
// import { $, IconWithText } from './icon-with-text';

// const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

// test('display.IconWithText', () => {
//   let el: HTMLElement;
//   let tester: PersonaTester;

//   setup(() => {
//     tester = testerFactory.build([IconWithText]);
//     el = tester.createElement('mk-icon-with-text', document.body);
//   });

//   should(`render the text and icon correctly`, async () => {
//     const iconLigature = 'iconLigature';
//     const label = 'label';

//     combineLatest(
//         tester.setAttribute(el, $.host._.icon, iconLigature),
//         tester.setAttribute(el, $.host._.label, label),
//     ).pipe(take(1)).subscribe();

//     const textSubject = createSpySubject();
//     tester.getTextContent(el, $.text).subscribe(textSubject);
//     const iconSubject = createSpySubject();
//     tester.getAttribute(el, $.icon._.icon).subscribe(iconSubject);

//     await retryUntil(() => textSubject.getValue()).to.equal(label);
//     await retryUntil(() => iconSubject.getValue()).to.equal(iconLigature);
//   });

//   test('renderIconClasses_', () => {
//     should(`render 'hasIcon' class if icon attribute is set`, async () => {
//       const iconLigature = 'iconLigature';
//       tester.setAttribute(el, $.host._.icon, iconLigature).pipe(take(1)).subscribe();

//       const classlistSubject = createSpySubject<ImmutableSet<string>>();
//       tester.getClassList(el, $.icon).subscribe(classlistSubject);

//       await retryUntil(() => classlistSubject.getValue()).to
//           .equal(match.anyIterableThat().haveElements(['hasIcon']));
//     });

//     should(`render nothing if the icon attribute is not set`, async () => {
//       const classlistSubject = createSpySubject<ImmutableSet<string>>();
//       tester.getClassList(el, $.icon).subscribe(classlistSubject);

//       await retryUntil(() => classlistSubject.getValue()).to
//           .equal(match.anyIterableThat().beEmpty());
//     });
//   });

//   test('renderTextClasses_', () => {
//     should(`render 'hasText' class if the label is set`, async () => {
//       const label = 'label';
//       tester.setAttribute(el, $.host._.label, label).pipe(take(1)).subscribe();

//       const classlistSubject = createSpySubject<ImmutableSet<string>>();
//       tester.getClassList(el, $.text).subscribe(classlistSubject);

//       await retryUntil(() => classlistSubject.getValue()).to
//           .equal(match.anyIterableThat().haveElements(['hasText']));
//     });

//     should(`render nothing if the slot is empty`, async () => {
//       const classlistSubject = createSpySubject<ImmutableSet<string>>();
//       tester.getClassList(el, $.text).subscribe(classlistSubject);

//       await retryUntil(() => classlistSubject.getValue()).to
//           .equal(match.anyIterableThat().beEmpty());
//     });
//   });
// });
