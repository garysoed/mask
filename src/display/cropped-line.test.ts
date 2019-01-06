import { assert, should, test } from 'gs-testing/export/main';
import { createSpyInstance, spy } from 'gs-testing/export/spy';
import { PersonaTester, PersonaTesterFactory } from 'persona/export/testing';
import { _p, _v } from '../app/app';
import { $, $postfixBoundary, CroppedLine } from './cropped-line';

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test.skip('display.CroppedLine', () => {
  let tester: PersonaTester;
  let el: HTMLElement;

  beforeEach(() => {
    tester = testerFactory.build([CroppedLine]);
    el = tester.createElement('mk-cropped-line', document.body);
  });

  test('onContainerCopy', () => {
    should(`set the clipboard data correctly`, async () => {
      const value = 'value';

      await tester.setAttribute(el, $.host._.text, value).toPromise();

      const mockDataTransfer = createSpyInstance(DataTransfer);
      const event = Object.assign(
          new Event('copy'),
          {clipboardData: mockDataTransfer},
      );
      const preventDefaultSpy = spy(event, 'preventDefault');
      const stopPropagationSpy = spy(event, 'stopPropagation');
      tester.dispatchEvent(el, $.container, event).subscribe();

      assert(preventDefaultSpy).to.haveBeenCalledWith();
      assert(stopPropagationSpy).to.haveBeenCalledWith();
      assert(mockDataTransfer.setData).to.haveBeenCalledWith('text/plain', value);
    });
  });

  test('providesPostfixBoundary_', () => {
    should(`return the correct index for short texts`, async () => {
      await tester.setAttribute(el, $.host._.text, 'ab').toPromise();

      await assert(tester.getObservable(el, $postfixBoundary)).to.emitWith(0);
    });

    should(`return the correct index for long texts`, async () => {
      await tester.setAttribute(el, $.host._.text, 'abcdefg').toPromise();

      await assert(tester.getObservable(el, $postfixBoundary)).to.emitWith(4);
    });
  });

  test('providesPostfixTextContent_', () => {
    should(`set the postfix text correctly`, async () => {
      await tester.setAttribute(el, $.host._.text, 'abcde').toPromise();

      await assert(tester.getTextContent(el, $.postfix)).to.emitWith('cde');
    });
  });

  test('providesPrefixTextContent_', () => {
    should(`set the prefix text correctly`, async () => {
      await tester.setAttribute(el, $.host._.text, 'abcde').toPromise();

      await assert(tester.getTextContent(el, $.prefix)).to.emitWith('ab');
    });
  });
});
