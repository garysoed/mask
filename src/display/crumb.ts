import { InstanceofType } from 'gs-tools/node_modules/gs-types/export';
import { StringType } from 'gs-types/export';
import { attributeIn, dispatcher, DispatchFn, element, onDom } from 'persona/export/input';
import { textContent } from 'persona/export/output';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
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
  input: [
    $.host._.dispatch,
    $.host._.display,
    $.host._.onClick,
  ],
  tag: 'mk-crumb',
  template: crumbTemplate,
})
@_p.render($.text._.text).withForwarding($.host._.display.id)
class Crumb extends ThemedCustomElementCtrl {
  @_p.onCreate()
  onHostClick_(
      @_v.vineIn($.host._.onClick.id) onClickObs: Observable<Event>,
      @_v.vineIn($.host._.dispatch.id) dispatcherObs: Observable<DispatchFn<ActionEvent>>,
  ): Observable<unknown> {
    return onClickObs
        .pipe(
            withLatestFrom(dispatcherObs),
            tap(([, dispatcher]) => dispatcher(new ActionEvent())),
        );
  }
}

export interface CrumbConfig extends Config {
  ctor: typeof Crumb;
}

export function crumb(): CrumbConfig {
  return {ctor: Crumb, tag: 'mk-crumb'};
}
