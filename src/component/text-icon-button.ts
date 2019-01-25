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

import { BooleanType, ElementWithTagType, StringType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attributeIn, dispatcher, DispatchFn, element, onDom, onKeydown } from 'persona/export/input';
import { attributeOut } from 'persona/export/output';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { TextIconButtonConfig } from '../configs/text-icon-button-config';
import { IconWithTextConfig } from '../display/icon-with-text';
import { ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, integerParser, stringParser } from '../util/parsers';
import textButtonTemplate from './text-icon-button.html';

export const $ = {
  host: element({
    ariaDisabled: attributeOut('aria-disabled', booleanParser()),
    ariaLabelIn: attributeIn('aria-label', stringParser(), StringType, ''),
    ariaLabelOut: attributeOut('aria-label', stringParser()),
    disabled: attributeIn('disabled', booleanParser(), BooleanType, false),
    dispatch: dispatcher(),
    icon: attributeIn('icon', stringParser(), StringType, ''),
    label: attributeIn('label', stringParser(), StringType, ''),
    onClick: onDom('click'),
    onEnterDown: onKeydown('Enter'),
    onSpaceDown: onKeydown(' '),
    role: attributeOut('role', stringParser()),
    tabindex: attributeOut('tabindex', integerParser()),
  }),
  iconWithText: element('iconWithText', ElementWithTagType('mk-icon-with-text'), {
    icon: attributeOut('icon', stringParser()),
    label: attributeOut('label', stringParser()),
    mode: attributeOut('mode', stringParser()),
  }),
};

@_p.customElement({
  input: [
    $.host._.ariaLabelIn,
    $.host._.disabled,
    $.host._.dispatch,
    $.host._.icon,
    $.host._.label,
    $.host._.onClick,
    $.host._.onEnterDown,
    $.host._.onSpaceDown,
  ],
  tag: 'mk-text-icon-button',
  template: textButtonTemplate,
})
@_p.render($.host._.ariaDisabled).withForwarding($.host._.disabled.id)
@_p.render($.iconWithText._.label).withForwarding($.host._.label.id)
@_p.render($.iconWithText._.icon).withForwarding($.host._.icon.id)
export class TextIconButton extends ThemedCustomElementCtrl {
  @_p.render($.host._.role) readonly role_: AriaRole = AriaRole.BUTTON;

  @_p.render($.host._.ariaLabelOut)
  renderHostAriaLabel_(
      @_p.input($.host._.ariaLabelIn) hostAriaLabelObs: Observable<string>,
      @_p.input($.host._.label) hostLabelObs: Observable<string>): Observable<string> {
    return combineLatest(hostAriaLabelObs, hostLabelObs)
        .pipe(map(([hostAriaLabel, hostLabel]) => hostAriaLabel || hostLabel));
  }

  @_p.render($.iconWithText._.mode)
  renderIconMode_(
      @_p.input($.host._.disabled) disabledObs: Observable<boolean>,
  ): Observable<string> {
    return disabledObs.pipe(map(disabled => disabled ? 'disabled' : ''));
  }

  @_p.render($.host._.tabindex)
  renderTabIndex_(@_p.input($.host._.disabled) hostDisabledObs: Observable<boolean>):
      Observable<number> {
    return hostDisabledObs.pipe(map(disabled => disabled ? -1 : 0));
  }

  @_p.onCreate()
  setupActions_(
      @_p.input($.host._.onClick) onClickObs: Observable<Event>,
      @_p.input($.host._.onEnterDown) onEnterDownObs: Observable<Event>,
      @_p.input($.host._.onSpaceDown) onSpaceDownObs: Observable<Event>,
      @_p.input($.host._.disabled) disabledObs: Observable<boolean>,
      @_p.input($.host._.dispatch) dispatcherObs: Observable<DispatchFn<ActionEvent>>,
  ): Observable<unknown> {
    return merge(
            onClickObs,
            onEnterDownObs,
            onSpaceDownObs,
        )
        .pipe(
            withLatestFrom(
                disabledObs,
                dispatcherObs,
            ),
            filter(([, disabled]) => !disabled),
            tap(([, , dispatch]) => {
              dispatch(new ActionEvent());
            }),
        );
  }
}

export function textIconButton(iconWithTextConfig: IconWithTextConfig): TextIconButtonConfig {
  return {dependencies: [iconWithTextConfig], tag: 'mk-text-icon-button'};
}
