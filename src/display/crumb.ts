import { InstanceofType } from 'gs-tools/node_modules/gs-types/export';
import { StringType } from 'gs-types/export';
import { attributeIn, element, onDom } from 'persona/export/input';
import { dispatcher, textContent } from 'persona/export/output';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import crumbTemplate from './crumb.html';

export const $ = {
  host: element({
    dispatch: dispatcher(),
    display: attributeIn('display', stringParser(), StringType, ''),
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
@_p.render($.text._.text).withForwarding($.host._.display)
export class Crumb extends ThemedCustomElementCtrl {
  @_p.render($.host._.dispatch)
  onHostClick_(
      @_p.input($.host._.onClick) onClickObs: Observable<Event>,
  ): Observable<ActionEvent> {
    return onClickObs.pipe(map(() => new ActionEvent()));
  }
}

export interface CrumbConfig extends Config {
  ctor: typeof Crumb;
}

export function crumb(): CrumbConfig {
  return {ctor: Crumb, tag: 'mk-crumb'};
}
