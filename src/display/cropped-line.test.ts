import { assert, createSpyInstance, should, spy, test } from '@gs-testing';
import { PersonaTester, PersonaTesterFactory } from '@persona/testing';
import { _p } from '../app/app';
import { $, CroppedLine } from './cropped-line';

const testerFactory = new PersonaTesterFactory(_p);

test('display.CroppedLine', () => {
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
      tester.dispatchEvent(el, $.container._.onCopy, event).subscribe();

      assert(preventDefaultSpy).to.haveBeenCalledWith();
      assert(stopPropagationSpy).to.haveBeenCalledWith();
      assert(mockDataTransfer.setData).to.haveBeenCalledWith('text/plain', value);
    });
  });

  test('providesPostfixTextContent', () => {
    should(`set the postfix text correctly`, async () => {
      await tester.setAttribute(el, $.host._.text, 'abcde').toPromise();

      await assert(tester.getTextContent(el, $.postfix)).to.emitWith('cde');
    });
  });

  test('providesPrefixTextContent', () => {
    should(`set the prefix text correctly`, async () => {
      await tester.setAttribute(el, $.host._.text, 'abcde').toPromise();

      await assert(tester.getTextContent(el, $.prefix)).to.emitWith('ab');
    });
  });
});
