import { InstanceofType } from '@gs-types';
import { attributeIn, dispatcher, element, InitFn, innerHtml, onDom, textContent } from '@persona';
import { Observable } from '@rxjs';
import { map } from '@rxjs/operators';

import { _p, _v } from '../app/app';
import separatorSvg from '../asset/separator.svg';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';

import crumbTemplate from './crumb.html';

export const $ = {
  host: element({
    dispatch: dispatcher(ACTION_EVENT),
    display: attributeIn('display', stringParser(), ''),
    onClick: onDom('click'),
  }),
  svg: element('svg', InstanceofType(HTMLDivElement), {
    innerHtml: innerHtml(),
  }),
  text: element('text', InstanceofType(HTMLDivElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  tag: 'mk-crumb',
  template: crumbTemplate,
})
export class Crumb extends ThemedCustomElementCtrl {
  private readonly hostDisplayObs = this.declareInput($.host._.display);
  private readonly onClickObs = this.declareInput($.host._.onClick);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.text._.text).withObservable(this.hostDisplayObs),
      this.renderStream($.host._.dispatch, this.onHostClick),
      _p.render($.svg._.innerHtml).withValue(separatorSvg),
    ];
  }

  onHostClick(): Observable<ActionEvent> {
    return this.onClickObs.pipe(map(() => new ActionEvent()));
  }
}
