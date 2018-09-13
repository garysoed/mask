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
import { CustomElementCtrl } from 'persona/export/main';
import { persona_, vine_ } from '../app/app';
import { IconConfig } from '../display/icon-config';
import { ActionEvent } from '../event/action-event';
import { injectGeneralCss } from '../theme/inject-general-css';
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
export class TextIconButton extends CustomElementCtrl {
  @persona_.render($.host.role) readonly role_: AriaRole = AriaRole.BUTTON;

  private async activate_(vine: VineImpl): Promise<void> {
    const [disabled, dispatch] = await Promise.all([
      vine.getLatest($.host.disabled.getReadingId(), this),
      vine.getLatest($.host.dispatch.getReadingId(), this),
    ]);

    if (!dispatch) {
      return;
    }

    if (disabled) {
      return;
    }

    dispatch(new ActionEvent());
  }

  init(vine: VineImpl): void {
    injectGeneralCss(vine, this, $.style.el);
  }

  @persona_.onKeydown($.host.el, 'Enter')
  @persona_.onKeydown($.host.el, ' ')
  onAction_(_: KeyboardEvent, vine: VineImpl): void {
    this.activate_(vine);
  }

  @persona_.onDom($.host.el, 'click')
  onClick_(_: MouseEvent, vine: VineImpl): void {
    this.activate_(vine);
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
