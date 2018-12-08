import { VineImpl } from 'grapevine/export/main';
import { InstanceofType } from 'gs-tools/node_modules/gs-types/export';
import { StringType } from 'gs-types/export';
import { attributeIn, dispatcher, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';
import crumbTemplate from './crumb.html';

export const $ = resolveLocators({
  host: {
    dispatch: dispatcher(shadowHost),
    display: attributeIn(shadowHost, 'display', stringParser(), StringType, ''),
    el: shadowHost,
  },
  text: {
    el: element('#text', InstanceofType(HTMLDivElement)),
    text: textContent(element('text.el')),
  },
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.customElement({
  tag: 'mk-crumb',
  template: crumbTemplate,
  watch: [
    $.host.dispatch,
  ],
})
@_p.render($.text.text).withForwarding($.host.display)
class Crumb extends ThemedCustomElementCtrl {
  @_p.onDom($.host.el, 'click')
  onHostClick_(_: Event, vine: VineImpl): void {
    combineLatest(
        vine.getObservable($.host.dispatch.getReadingId(), this),
        )
        .pipe(take(1))
        .subscribe(([dispatcher]) => dispatcher(new ActionEvent()));
  }
}

export interface CrumbConfig extends Config {
  ctor: typeof Crumb;
}

export function crumb(): CrumbConfig {
  return {ctor: Crumb, tag: 'mk-crumb'};
}
