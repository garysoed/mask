/**
 * @webcomponent mk-text-icon-button
 * A basic text button with an icon
 *
 * @attr {<boolean} disabled True iff the button should be disabled.
 * @attr {<string} label Label on the button.
 * @attr {<string} aria-label A11y label on the button. Defaults to label if not specified.
 * @attr {<string} icon-family
 * @attr {<string} icon Icon ligature
 */

import { VineImpl } from 'grapevine/export/main';
import { BooleanType, ElementWithTagType, InstanceofType, NumberType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attribute, dispatcher, element, resolveLocators, shadowHost, textContent } from 'persona/export/locator';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { _p } from '../app/app';
import { IconWithTextConfig } from '../display/icon-with-text';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, integerParser, stringParser } from '../util/parsers';
import { TextIconButtonConfig } from './text-icon-button-config';
import textButtonTemplate from './text-icon-button.html';

export const $ = resolveLocators({
  host: {
    ariaDisabled: attribute(shadowHost, 'aria-disabled', booleanParser(), BooleanType, false),
    ariaLabel: attribute(shadowHost, 'aria-label', stringParser(), StringType, ''),
    disabled: attribute(shadowHost, 'disabled', booleanParser(), BooleanType, false),
    dispatch: dispatcher(shadowHost),
    el: shadowHost,
    icon: attribute(shadowHost, 'icon', stringParser(), StringType, ''),
    iconFamily: attribute(shadowHost, 'icon-family', stringParser(), StringType, ''),
    label: attribute(shadowHost, 'label', stringParser(), StringType, ''),
    role: attribute(shadowHost, 'role', stringParser(), StringType, AriaRole.BUTTON),
    tabindex: attribute(shadowHost, 'tabindex', integerParser(), NumberType, 0),
  },
  iconWithText: {
    el: element('#iconWithText', ElementWithTagType('mk-icon-with-text')),
    icon: attribute(element('iconWithText.el'), 'icon', stringParser(), StringType),
    iconFamily: attribute(element('iconWithText.el'), 'icon-family', stringParser(), StringType),
    label: attribute(element('iconWithText.el'), 'label', stringParser(), StringType),
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
@_p.render($.iconWithText.label).withForwarding($.host.label)
@_p.render($.iconWithText.iconFamily).withForwarding($.host.iconFamily)
@_p.render($.iconWithText.icon).withForwarding($.host.icon)
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

export function textIconButton(iconWithTextConfig: IconWithTextConfig): TextIconButtonConfig {
  return {dependencies: [iconWithTextConfig], tag: 'mk-text-icon-button'};
}
