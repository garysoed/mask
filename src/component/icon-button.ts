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
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p } from '../app/app';
import { IconConfig } from '../display/icon-config';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { IconButtonConfig } from './icon-button-config';
import iconButtonTemplate from './icon-button.html';

export const $ = resolveLocators({
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
  theme: {
    el: element('#theme', InstanceofType(HTMLStyleElement)),
  },
});

@_p.customElement({
  tag: 'mk-icon-button',
  template: iconButtonTemplate,
  watch: [
    $.host.dispatch,
    $.theme.el,
  ],
})
@_p.render($.icon.iconFamily).withForwarding($.host.iconFamily)
@_p.render($.host.ariaDisabled).withForwarding($.host.disabled)
export class IconButton extends ThemedCustomElementCtrl {
  @_p.render($.host.role) readonly role_: AriaRole = AriaRole.BUTTON;

  constructor() {
    super($.theme.el);
  }

  init(): void {
    // Noop
  }

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

  @_p.render($.host.tabindex)
  renderTabIndex_(@_p.input($.host.disabled) hostDisabled: boolean): number {
    return hostDisabled ? -1 : 0;
  }
}

export function iconButton(iconConfig: IconConfig): IconButtonConfig {
  return {
    ctor: IconButton,
    dependencies: [iconConfig],
  };
}
