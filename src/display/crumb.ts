import { instanceofType } from 'gs-types';
import { attributeIn, dispatcher, element, onDom, PersonaContext, stringParser, textContent, InnerHtmlRenderSpec, single, RenderSpec } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import separatorSvg from '../asset/separator.svg';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import crumbTemplate from './crumb.html';


export const $ = {
  host: element({
    dispatch: dispatcher(ACTION_EVENT),
    display: attributeIn('display', stringParser(), ''),
    onClick: onDom('click'),
  }),
  svg: element('svg', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
  text: element('text', instanceofType(HTMLDivElement), {
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

  constructor(context: PersonaContext) {
    super(context);
    this.render($.text._.text, this.hostDisplayObs);
    this.render($.host._.dispatch, this.onHostClick());
    this.render($.svg._.content, this.renderSvgContent());
  }

  private onHostClick(): Observable<ActionEvent> {
    return this.onClickObs.pipe(map(() => new ActionEvent()));
  }

  private renderSvgContent(): Observable<RenderSpec> {
    return observableOf(new InnerHtmlRenderSpec(
        separatorSvg,
        'image/svg+xml',
        this.vine,
    ));
  }
}
