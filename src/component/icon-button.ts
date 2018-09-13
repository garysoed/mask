/**
 * @webcomponent mk-text-button
 * A basic text button.
 *
 * @attr {<boolean} disabled True iff the button should be disabled.
 * @attr {<string} ariaLabel A11y label on the button. Defaults to label if not specified.
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredFonts.
 * @attr {<string} label Label on the button.
 * @slot The glyph of the icon to display.
 */

import { VineImpl } from 'grapevine/export/main';
import { BooleanParser, IntegerParser, StringParser } from 'gs-tools/export/parse';
import { BooleanType, InstanceofType, NumberType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attribute, dispatcher, element, resolveLocators, shadowHost } from 'persona/export/locator';
import { CustomElementCtrl } from 'persona/export/main';
import { persona_ } from '../app/app';
import { IconConfig } from '../display/icon-config';
import { ActionEvent } from '../event/action-event';
import { IconButtonConfig } from './icon-button-config';
import iconButtonTemplate from './icon-button.html';

const $ = resolveLocators({
  host: {
    ariaDisabled: attribute(shadowHost, 'aria-disabled', BooleanParser, BooleanType, false),
    disabled: attribute(shadowHost, 'disabled', BooleanParser, BooleanType, false),
    dispatch: dispatcher(shadowHost),
    el: shadowHost,
    iconFamily: attribute(shadowHost, 'icon-family', StringParser, StringType, ''),
    role: attribute(shadowHost, 'role', StringParser, StringType, AriaRole.BUTTON),
    tabindex: attribute(shadowHost, 'tabindex', IntegerParser, NumberType, 0),
  },
  icon: {
    el: element('#icon', InstanceofType(HTMLElement)),
    iconFamily: attribute(element('icon.el'), 'icon-family', StringParser, StringType, ''),
  },
});

@persona_.customElement({
  tag: 'mk-icon-button',
  template: iconButtonTemplate,
  watch: [
    $.host.disabled,
    $.host.dispatch,
    $.host.iconFamily,
    $.icon.el,
    shadowHost,
  ],
})
@persona_.render($.icon.iconFamily).withForwarding($.host.iconFamily)
@persona_.render($.host.ariaDisabled).withForwarding($.host.disabled)
export class IconButton extends CustomElementCtrl {
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

  @persona_.render($.host.tabindex)
  renderTabIndex_(@persona_.input($.host.disabled) hostDisabled: boolean): number {
    return hostDisabled ? -1 : 0;
  }
}

export function iconButton(iconConfig: IconConfig): IconButtonConfig {
  return {
    ctor: IconButton,
    dependencies: [iconConfig],
  };
}
