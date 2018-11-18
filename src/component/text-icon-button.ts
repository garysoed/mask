/**
 * @webcomponent mk-text-button
 * A basic text button.
 *
 * @attr {<boolean} disabled True iff the button should be disabled.
 * @attr {<string} label Label on the button.
 * @attr {<string} ariaLabel A11y label on the button. Defaults to label if not specified.
 */

import { VineImpl } from 'grapevine/export/main';
import { BooleanParser, IntegerParser, StringParser } from 'gs-tools/export/parse';
import { BooleanType, InstanceofType, NumberType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attribute, dispatcher, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p } from '../app/app';
import { IconConfig } from '../display/icon-config';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { TextIconButtonConfig } from './text-icon-button-config';
import textButtonTemplate from './text-icon-button.html';

export const $ = resolveLocators({
  host: {
    ariaDisabled: attribute(shadowHost, 'aria-disabled', BooleanParser, BooleanType, false),
    ariaLabel: attribute(shadowHost, 'aria-label', StringParser, StringType, ''),
    disabled: attribute(shadowHost, 'disabled', BooleanParser, BooleanType, false),
    dispatch: dispatcher(shadowHost),
    el: shadowHost,
    iconFamily: attribute(shadowHost, 'icon-family', StringParser, StringType, ''),
    label: attribute(shadowHost, 'label', StringParser, StringType, ''),
    role: attribute(shadowHost, 'role', StringParser, StringType, AriaRole.BUTTON),
    tabindex: attribute(shadowHost, 'tabindex', IntegerParser, NumberType, 0),
  },
  icon: {
    el: element('#icon', InstanceofType(HTMLElement)),
    iconFamily: attribute(element('icon.el'), 'icon-family', StringParser, StringType, ''),
  },
  text: {
    el: element('#text', InstanceofType(HTMLDivElement)),
    text: textContent(element('text.el')),
  },
});

@_p.customElement({
  tag: 'mk-text-icon-button',
  template: textButtonTemplate,
  watch: [
    $.host.dispatch,
  ],
})
@_p.render($.host.ariaDisabled).withForwarding($.host.disabled)
@_p.render($.text.text).withForwarding($.host.label)
@_p.render($.icon.iconFamily).withForwarding($.host.iconFamily)
export class TextIconButton extends ThemedCustomElementCtrl {
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

export function textIconButton(iconConfig: IconConfig): TextIconButtonConfig {
  return {dependencies: [iconConfig], tag: 'mk-text-icon-button'};
}
