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

import { ElementWithTagType } from 'gs-types/export';
import { AriaRole } from 'persona/export/a11y';
import { attributeIn, element, hasAttribute, onDom, onKeydown } from 'persona/export/input';
import { attributeOut, dispatcher } from 'persona/export/output';
import { combineLatest, merge, Observable } from 'rxjs';
import { filter, map, mapTo, startWith, withLatestFrom } from 'rxjs/operators';
import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, integerParser, stringParser } from '../util/parsers';
import textButtonTemplate from './text-icon-button.html';

export const $ = {
  host: element({
    ariaDisabled: attributeOut('aria-disabled', booleanParser()),
    ariaLabelIn: attributeIn('aria-label', stringParser(), ''),
    ariaLabelOut: attributeOut('aria-label', stringParser()),
    disabled: attributeIn('disabled', booleanParser(), false),
    dispatch: dispatcher(ACTION_EVENT),
    hasMkPrimary: hasAttribute('mk-primary'),
    icon: attributeIn('icon', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    onClick: onDom('click'),
    onEnterDown: onKeydown('Enter'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
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
  tag: 'mk-text-icon-button',
  template: textButtonTemplate,
})
@_p.render($.host._.ariaDisabled).withForwarding($.host._.disabled)
@_p.render($.iconWithText._.label).withForwarding($.host._.label)
@_p.render($.iconWithText._.icon).withForwarding($.host._.icon)
export class TextIconButton extends ThemedCustomElementCtrl {
  @_p.render($.host._.role) readonly role_: AriaRole = AriaRole.BUTTON;

  @_p.render($.host._.dispatch)
  renderDispatchActions_(
      @_p.input($.host._.onClick) onClickObs: Observable<Event>,
      @_p.input($.host._.onEnterDown) onEnterDownObs: Observable<Event>,
      @_p.input($.host._.onSpaceDown) onSpaceDownObs: Observable<Event>,
      @_p.input($.host._.disabled) disabledObs: Observable<boolean>,
  ): Observable<ActionEvent> {
    return merge(
            onClickObs,
            onEnterDownObs,
            onSpaceDownObs,
        )
        .pipe(
            withLatestFrom(
                disabledObs,
            ),
            filter(([, disabled]) => !disabled),
            map(() => new ActionEvent()),
        );
  }

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
      @_p.input($.host._.onMouseEnter) onMouseEnterObs: Observable<MouseEvent>,
      @_p.input($.host._.onMouseLeave) onMouseLeaveObs: Observable<MouseEvent>,
      @_p.input($.host._.hasMkPrimary) primaryObs: Observable<boolean>,
  ): Observable<string> {
    const hoverObs = merge(
        onMouseEnterObs.pipe(mapTo(true)),
        onMouseLeaveObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    return combineLatest(
        disabledObs,
        hoverObs,
        primaryObs,
    )
    .pipe(
        map(([disabled, hover, primary]) => {
          if (disabled) {
            return primary ? 'primaryDisabled' : 'disabled';
          }

          if (hover) {
            return primary ? 'primaryFocus' : 'focus';
          }

          return primary ? 'actionPrimary' : 'action';
        }),
    );
  }

  @_p.render($.host._.tabindex)
  renderTabIndex_(@_p.input($.host._.disabled) hostDisabledObs: Observable<boolean>):
      Observable<number> {
    return hostDisabledObs.pipe(map(disabled => disabled ? -1 : 0));
  }
}
