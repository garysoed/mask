import {assert, createSpyInstance, should, spy, test} from 'gs-testing';
import {PersonaTesterFactory} from 'persona/export/testing';

import {_p} from '../app/app';

import {$, CroppedLine} from './cropped-line';


const testerFactory = new PersonaTesterFactory(_p);

test('display.CroppedLine', init => {

  const _ = init(() => {
    const tester = testerFactory.build([CroppedLine], document);
    const el = tester.createElement('mk-cropped-line');
    return {el, tester};
  });

  test('onContainerCopy', () => {
    should('set the clipboard data correctly', () => {
      const value = 'value';

      _.el.setAttribute($.host._.text, value);

      const mockDataTransfer = createSpyInstance(DataTransfer);
      const event = Object.assign(
          new Event('copy'),
          {clipboardData: mockDataTransfer},
      );
      const preventDefaultSpy = spy(event, 'preventDefault');
      const stopPropagationSpy = spy(event, 'stopPropagation');
      _.el.dispatchEvent($.container._.onCopy, event);

      assert(preventDefaultSpy).to.haveBeenCalledWith();
      assert(stopPropagationSpy).to.haveBeenCalledWith();
      assert(mockDataTransfer.setData).to.haveBeenCalledWith('text/plain', value);
    });
  });

  test('renderPostfixTextContent', () => {
    should('set the postfix text correctly', () => {
      _.el.setAttribute($.host._.text, 'abcde');

      assert(_.el.getTextContent($.postfix)).to.equal('cde');
    });
  });

  test('renderPrefixTextContent', () => {
    should('set the prefix text correctly', () => {
      _.el.setAttribute($.host._.text, 'abcde');

      assert(_.el.getTextContent($.prefix)).to.equal('ab');
    });
  });
});
