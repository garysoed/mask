import { Vine } from 'grapevine';
import { InstanceofType } from 'gs-types';
import { attributeIn, dispatcher, element, innerHtml, onDom, textContent } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
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

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.render($.text._.text).withObservable(this.hostDisplayObs);
    this.render($.host._.dispatch).withFunction(this.onHostClick);
    this.render($.svg._.innerHtml).withValue(separatorSvg);
  }

  onHostClick(): Observable<ActionEvent> {
    return this.onClickObs.pipe(map(() => new ActionEvent()));
  }
}
