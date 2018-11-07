import { assert, should } from 'gs-testing/export/main';
import { createSpyInstance, spy } from 'gs-testing/export/spy';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $, $postfixBoundary, croppedLine } from './cropped-line';

const {ctor} = croppedLine();
const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

describe('display.CroppedLine', () => {
  let tester: PersonaTester;
  let el: HTMLElement;

  beforeEach(() => {
    tester = testerFactory.build([ctor]);
    el = tester.createElement('mk-cropped-line', document.body);
  });

  describe('onContainerCopy', () => {
    should(`set the clipboard data correctly`, async () => {
      const value = 'value';

      await tester.setAttribute(el, $.host.text, value);

      const mockDataTransfer = createSpyInstance(DataTransfer);
      const event = Object.assign(
          new Event('copy'),
          {clipboardData: mockDataTransfer},
      );
      const preventDefaultSpy = spy(event, 'preventDefault');
      const stopPropagationSpy = spy(event, 'stopPropagation');
      tester.dispatchEvent(el, $.container.el, event);

      assert(preventDefaultSpy).to.haveBeenCalledWith();
      assert(stopPropagationSpy).to.haveBeenCalledWith();
      assert(mockDataTransfer.setData).to.haveBeenCalledWith('text/plain', value);
    });
  });

  describe('providesPostfixBoundary_', () => {
    should(`return the correct index for short texts`, async () => {
      await tester.setAttribute(el, $.host.text, 'ab');

      const boundarySubject = new BehaviorSubject<number|null>(null);
      tester.getObservable(el, $postfixBoundary).subscribe(boundarySubject);

      assert(boundarySubject.getValue()).to.equal(0);
    });

    should(`return the correct index for long texts`, async () => {
      await tester.setAttribute(el, $.host.text, 'abcdefg');

      const boundarySubject = new BehaviorSubject<number|null>(null);
      tester.getObservable(el, $postfixBoundary).subscribe(boundarySubject);

      assert(boundarySubject.getValue()).to.equal(4);
    });
  });

  describe('providesPostfixTextContent_', () => {
    should(`set the postfix text correctly`, async () => {
      await tester.setAttribute(el, $.host.text, 'abcde');

      assert(tester.getTextContent(el, $.postfix.textContent)).to.equal('cde');
    });
  });

  describe('providesPrefixTextContent_', () => {
    should(`set the prefix text correctly`, async () => {
      await tester.setAttribute(el, $.host.text, 'abcde');

      assert(tester.getTextContent(el, $.prefix.textContent)).to.equal('ab');
    });
  });
});
