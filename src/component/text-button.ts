/**
 * @webcomponent mk-text-button
 * A basic text button.
 *
 * @attr {<boolean} disabled True iff the button should be disabled.
 * @attr {<string} label Label on the button.
 * @attr {<string} ariaLabel A11y label on the button. Defaults to label if not specified.
 */

import { VineImpl } from 'grapevine/export/main';
import { BooleanType, InstanceofType, NumberType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attribute, dispatcher, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, integerParser, stringParser } from '../util/parsers';
import textButtonTemplate from './text-button.html';

export const $ = resolveLocators({
  host: {
    ariaDisabled: attribute(shadowHost, 'aria-disabled', booleanParser(), BooleanType, false),
    ariaLabel: attribute(shadowHost, 'aria-label', stringParser(), StringType, ''),
    disabled: attribute(shadowHost, 'disabled', booleanParser(), BooleanType, false),
    dispatch: dispatcher(shadowHost),
    el: shadowHost,
    label: attribute(shadowHost, 'label', stringParser(), StringType, ''),
    role: attribute(shadowHost, 'role', stringParser(), StringType, AriaRole.BUTTON),
    tabindex: attribute(shadowHost, 'tabindex', integerParser(), NumberType, 0),
  },
  root: {
    el: element('#root', InstanceofType(HTMLDivElement)),
    text: textContent(element('root.el')),
  },
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.customElement({
  tag: 'mk-text-button',
  template: textButtonTemplate,
  watch: [
    $.host.dispatch,
    $.host.el,
  ],
})
@_p.render($.host.ariaDisabled).withForwarding($.host.disabled)
@_p.render($.root.text).withForwarding($.host.label)
export class TextButton extends ThemedCustomElementCtrl {
  @_p.render($.host.role) readonly role_: AriaRole = AriaRole.BUTTON;

  @_p.onKeydown($.host.el, 'Enter')
  @_p.onKeydown($.host.el, ' ')
  @_p.onDom($.host.el, 'click')
  onAction_(_: Event, vine: VineImpl): void {
    combineLatest(
        vine.getObservable($.host.disabled.getReadingId(), this),
        vine.getObservable($.host.dispatch.getReadingId(), this),
        )
        .pipe(take(1))
        .subscribe(([disabled, dispatch]) => {
          if (!dispatch) {
            return;
          }

          if (disabled) {
            return;
          }

          dispatch(new ActionEvent());
        });
  }

  @_p.render($.host.ariaLabel)
  renderHostAriaLabel_(
      @_p.input($.host.ariaLabel) hostAriaLabel: string,
      @_p.input($.host.label) hostLabel: string): string {
    return hostAriaLabel || hostLabel;
  }

  @_p.render($.host.tabindex)
  renderTabIndex_(@_p.input($.host.disabled) hostDisabled: boolean): number {
    return hostDisabled ? -1 : 0;
  }
}

export function textButton(): Config {
  return {tag: 'mk-text-button'};
}
