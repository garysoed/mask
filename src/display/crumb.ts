import { InstanceofType } from '@gs-types';
import { attributeIn, dispatcher, element, InitFn, onDom, textContent } from '@persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p, _v } from '../app/app';
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
  text: element('text', InstanceofType(HTMLDivElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  tag: 'mk-crumb',
  template: crumbTemplate,
})
export class Crumb extends ThemedCustomElementCtrl {
  private readonly hostDisplayObs = _p.input($.host._.display, this);
  private readonly onClickObs = _p.input($.host._.onClick, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.text._.text).withObservable(this.hostDisplayObs),
      _p.render($.host._.dispatch).withVine(_v.stream(this.onHostClick, this)),
    ];
  }

  onHostClick(): Observable<ActionEvent> {
    return this.onClickObs.pipe(map(() => new ActionEvent()));
  }
}
