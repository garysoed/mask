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
import { persona_ } from '../app/app';
import { IconConfig } from '../display/icon-config';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { TextIconButtonConfig } from './text-icon-button-config';
import textButtonTemplate from './text-icon-button.html';

const $ = resolveLocators({
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
  style: {
    el: element(`#style`, InstanceofType(HTMLStyleElement)),
  },
  text: {
    el: element('#text', InstanceofType(HTMLDivElement)),
    text: textContent(element('text.el')),
  },
});

@persona_.customElement({
  tag: 'mk-text-icon-button',
  template: textButtonTemplate,
  watch: [
    $.host.ariaLabel,
    $.host.disabled,
    $.host.dispatch,
    $.host.iconFamily,
    $.host.label,
    $.icon.el,
    $.style.el,
    $.text.el,
    shadowHost,
  ],
})
@persona_.render($.host.ariaDisabled).withForwarding($.host.disabled)
@persona_.render($.text.text).withForwarding($.host.label)
@persona_.render($.icon.iconFamily).withForwarding($.host.iconFamily)
export class TextIconButton extends ThemedCustomElementCtrl {
  @persona_.render($.host.role) readonly role_: AriaRole = AriaRole.BUTTON;

  constructor() {
    super($.style.el);
  }

  @persona_.onKeydown($.host.el, 'Enter')
  @persona_.onKeydown($.host.el, ' ')
  @persona_.onDom($.host.el, 'click')
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

  @persona_.render($.host.ariaLabel)
  renderHostAriaLabel_(
      @persona_.input($.host.ariaLabel) hostAriaLabel: string,
      @persona_.input($.host.label) hostLabel: string): string {
    return hostAriaLabel || hostLabel;
  }

  @persona_.render($.host.tabindex)
  renderTabIndex_(@persona_.input($.host.disabled) hostDisabled: boolean): number {
    return hostDisabled ? -1 : 0;
  }
}

export function textIconButton(iconConfig: IconConfig): TextIconButtonConfig {
  return {ctor: TextIconButton, dependencies: [iconConfig]};
}
