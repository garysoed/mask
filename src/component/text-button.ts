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
import { Config } from '../app/config';
import { ActionEvent } from '../event/action-event';
import textButtonTemplate from './text-button.html';

const $ = resolveLocators({
  host: {
    ariaDisabled: attribute(shadowHost, 'aria-disabled', BooleanParser, BooleanType, false),
    ariaLabel: attribute(shadowHost, 'aria-label', StringParser, StringType, ''),
    disabled: attribute(shadowHost, 'disabled', BooleanParser, BooleanType, false),
    dispatch: dispatcher(shadowHost),
    el: shadowHost,
    label: attribute(shadowHost, 'label', StringParser, StringType, ''),
    role: attribute(shadowHost, 'role', StringParser, StringType, AriaRole.BUTTON),
    tabindex: attribute(shadowHost, 'tabindex', IntegerParser, NumberType, 0),
  },
  root: {
    el: element('#root', InstanceofType(HTMLDivElement)),
    text: textContent(element('root.el')),
  },
});

@persona_.customElement({
  tag: 'mk-text-button',
  template: textButtonTemplate,
  watch: [
    $.host.ariaLabel,
    $.host.disabled,
    $.host.dispatch,
    $.host.label,
    $.root.el,
    shadowHost,
  ],
})
export class TextButton extends CustomElementCtrl {
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

  init(): void {
    // Noop
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

  @persona_.render($.host.ariaDisabled)
  renderHostAriaDisabled_(
      @vine_.vineIn($.host.disabled.getReadingId()) hostDisabled: boolean): boolean {
    return hostDisabled;
  }

  @persona_.render($.host.ariaLabel)
  renderHostAriaLabel_(
      @vine_.vineIn($.host.ariaLabel.getReadingId()) hostAriaLabel: string,
      @vine_.vineIn($.host.label.getReadingId()) hostLabel: string): string {
    return hostAriaLabel || hostLabel;
  }

  @persona_.render($.root.text)
  renderLabel_(
      @vine_.vineIn($.host.label.getReadingId()) hostLabel: string): string {
    return hostLabel;
  }

  @persona_.render($.host.tabindex)
  renderTabIndex_(
      @vine_.vineIn($.host.disabled.getReadingId()) hostDisabled: boolean): number {
    return hostDisabled ? -1 : 0;
  }
}

export function textButton(): Config {
  return {ctor: TextButton};
}
