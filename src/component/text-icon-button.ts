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
import { BooleanType, ElementWithTagType, NumberType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attributeIn, attributeOut, dispatcher, element, resolveLocators, shadowHost } from 'persona/export/locator';
import { combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { _p } from '../app/app';
import { TextIconButtonConfig } from '../configs/text-icon-button-config';
import { IconWithTextConfig } from '../display/icon-with-text';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, integerParser, stringParser } from '../util/parsers';
import textButtonTemplate from './text-icon-button.html';

export const $ = resolveLocators({
  host: {
    ariaDisabled: attributeOut(shadowHost, 'aria-disabled', booleanParser(), BooleanType),
    ariaLabelIn: attributeIn(shadowHost, 'aria-label', stringParser(), StringType, ''),
    ariaLabelOut: attributeOut(shadowHost, 'aria-label', stringParser(), StringType),
    disabled: attributeIn(shadowHost, 'disabled', booleanParser(), BooleanType, false),
    dispatch: dispatcher(shadowHost),
    el: shadowHost,
    icon: attributeIn(shadowHost, 'icon', stringParser(), StringType, ''),
    label: attributeIn(shadowHost, 'label', stringParser(), StringType, ''),
    role: attributeOut(shadowHost, 'role', stringParser(), StringType),
    tabindex: attributeOut(shadowHost, 'tabindex', integerParser(), NumberType),
  },
  iconWithText: {
    el: element('#iconWithText', ElementWithTagType('mk-icon-with-text')),
    icon: attributeOut(element('iconWithText.el'), 'icon', stringParser(), StringType),
    label: attributeOut(element('iconWithText.el'), 'label', stringParser(), StringType),
    mode: attributeOut(element('iconWithText.el'), 'mode', stringParser(), StringType),
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
          if (disabled) {
            return;
          }

          dispatch(new ActionEvent());
        });
  }

  @_p.render($.host.ariaLabelOut)
  renderHostAriaLabel_(
      @_p.input($.host.ariaLabelIn) hostAriaLabelObs: Observable<string>,
      @_p.input($.host.label) hostLabelObs: Observable<string>): Observable<string> {
    return combineLatest(hostAriaLabelObs, hostLabelObs)
        .pipe(map(([hostAriaLabel, hostLabel]) => hostAriaLabel || hostLabel));
  }

  @_p.render($.iconWithText.mode)
  renderIconMode_(@_p.input($.host.disabled) disabledObs: Observable<boolean>): Observable<string> {
    return disabledObs.pipe(map(disabled => disabled ? 'disabled' : ''));
  }

  @_p.render($.host.tabindex)
  renderTabIndex_(@_p.input($.host.disabled) hostDisabledObs: Observable<boolean>):
      Observable<number> {
    return hostDisabledObs.pipe(map(disabled => disabled ? -1 : 0));
  }
}

export function textIconButton(iconWithTextConfig: IconWithTextConfig): TextIconButtonConfig {
  return {dependencies: [iconWithTextConfig], tag: 'mk-text-icon-button'};
}
