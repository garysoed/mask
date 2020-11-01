import { NodeWithId, PersonaContext, attributeIn, dispatcher, element, host, onDom, renderHtml, single, stringParser, textContent } from 'persona';
import { Observable } from 'rxjs';
import { instanceofType } from 'gs-types';
import { map, withLatestFrom } from 'rxjs/operators';

import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { _p } from '../app/app';
import separatorSvg from '../asset/separator.svg';

import crumbTemplate from './crumb.html';


export const $crumb = {
  api: {
    dispatch: dispatcher(ACTION_EVENT),
    display: attributeIn('display', stringParser(), ''),
    key: attributeIn('key', stringParser(), ''),
    onClick: onDom('click'),
  },
  tag: 'mk-crumb',
};

export const $ = {
  host: host($crumb.api),
  svg: element('svg', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
  text: element('text', instanceofType(HTMLDivElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$crumb,
  template: crumbTemplate,
})
export class Crumb extends ThemedCustomElementCtrl {
  private readonly hostDisplay$ = this.declareInput($.host._.display);
  private readonly onClick$ = this.declareInput($.host._.onClick);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.text._.text, this.hostDisplay$);
    this.render($.host._.dispatch, this.onHostClick());
    this.render($.svg._.content, this.renderSvgContent());
  }

  private onHostClick(): Observable<ActionEvent<string>> {
    return this.onClick$.pipe(
        withLatestFrom(this.declareInput($.host._.key)),
        map(([, key]) => new ActionEvent(key)),
    );
  }

  private renderSvgContent(): Observable<NodeWithId<Node>|null> {
    return renderHtml(separatorSvg, 'image/svg+xml', separatorSvg, this.context);
  }
}
