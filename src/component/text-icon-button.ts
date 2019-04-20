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

import { ElementWithTagType } from '@gs-types';
import { InitFn } from '@persona';
import { AriaRole } from '@persona/a11y';
import { attributeIn, element, hasAttribute, onDom, onKeydown } from '@persona/input';
import { api } from '@persona/main';
import { attributeOut, dispatcher } from '@persona/output';
import { combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, withLatestFrom } from 'rxjs/operators';
import { _p, _v } from '../app/app';
import { $$ as $iconWithText, IconWithText } from '../display/icon-with-text';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, integerParser, stringParser } from '../util/parsers';
import textButtonTemplate from './text-icon-button.html';

export const $$ = {
  actionEvent: dispatcher(ACTION_EVENT),
  active: hasAttribute('active'),
  ariaDisabled: attributeOut('aria-disabled', booleanParser()),
  ariaLabelIn: attributeIn('aria-label', stringParser(), ''),
  ariaLabelOut: attributeOut('aria-label', stringParser()),
  disabled: attributeIn('disabled', booleanParser(), false),
  hasMkPrimary: hasAttribute('mk-primary'),
  icon: attributeIn('icon', stringParser(), ''),
  label: attributeIn('label', stringParser(), ''),
  tabindex: attributeOut('tabindex', integerParser()),
};

export const $ = {
  host: element({
    ...$$,
    onBlur: onDom('blur'),
    onClick: onDom('click'),
    onEnterDown: onKeydown('Enter'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
    onSpaceDown: onKeydown(' '),
    role: attributeOut('role', stringParser()),
  }),
  iconWithText: element('iconWithText', ElementWithTagType('mk-icon-with-text'), {
    ...api($iconWithText),
    icon: attributeOut('icon', stringParser()),
    label: attributeOut('label', stringParser()),
    mode: attributeOut('mode', stringParser()),
  }),
};

@_p.customElement({
  dependencies: [IconWithText],
  tag: 'mk-text-icon-button',
  template: textButtonTemplate,
})
export class TextIconButton extends ThemedCustomElementCtrl {
  private readonly activeObs = _p.input($.host._.active, this);
  private readonly ariaLabelObs = _p.input($.host._.ariaLabelIn, this);
  private readonly disabledObs = _p.input($.host._.disabled, this);
  private readonly hasPrimaryObs = _p.input($.host._.hasMkPrimary, this);
  private readonly iconObs = _p.input($.host._.icon, this);
  private readonly labelObs = _p.input($.host._.label, this);
  private readonly onBlurObs = _p.input($.host._.onBlur, this);
  private readonly onClickObs = _p.input($.host._.onClick, this);
  private readonly onEnterDownObs = _p.input($.host._.onEnterDown, this);
  private readonly onFocusObs = _p.input($.host._.onFocus, this);
  private readonly onMouseEnterObs = _p.input($.host._.onMouseEnter, this);
  private readonly onMouseLeaveObs = _p.input($.host._.onMouseLeave, this);
  private readonly onSpaceDownObs = _p.input($.host._.onSpaceDown, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.host._.role).withObservable(observableOf(AriaRole.BUTTON)),
      _p.render($.host._.ariaDisabled).withObservable(this.disabledObs),
      _p.render($.host._.actionEvent).withVine(_v.stream(this.renderDispatchActions, this)),
      _p.render($.host._.ariaLabelOut).withVine(_v.stream(this.renderHostAriaLabel, this)),
      _p.render($.host._.tabindex).withVine(_v.stream(this.renderTabIndex, this)),
      _p.render($.iconWithText._.label).withObservable(this.labelObs),
      _p.render($.iconWithText._.icon).withObservable(this.iconObs),
      _p.render($.iconWithText._.mode).withVine(_v.stream(this.renderIconMode, this)),
    ];
  }

  private renderDispatchActions(): Observable<ActionEvent> {
    return merge(
            this.onClickObs,
            this.onEnterDownObs,
            this.onSpaceDownObs,
        )
        .pipe(
            withLatestFrom(this.disabledObs),
            filter(([, disabled]) => !disabled),
            map(() => new ActionEvent()),
        );
  }

  private renderHostAriaLabel(): Observable<string> {
    return combineLatest(this.ariaLabelObs, this.labelObs)
        .pipe(map(([hostAriaLabel, hostLabel]) => hostAriaLabel || hostLabel));
  }

  renderIconMode(): Observable<string> {
    const hoverObs = merge(
        this.onMouseEnterObs.pipe(mapTo(true)),
        this.onMouseLeaveObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    const focusedObs = merge(
        this.onFocusObs.pipe(mapTo(true)),
        this.onBlurObs.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    return combineLatest(
        this.activeObs,
        this.disabledObs,
        focusedObs,
        hoverObs,
        this.hasPrimaryObs,
    )
    .pipe(
        map(([active, disabled, focused, hover, primary]) => {
          if (disabled) {
            return primary ? 'primaryDisabled' : 'disabled';
          }

          if (hover || focused) {
            return primary ? 'primaryFocus' : 'focus';
          }

          if (active) {
            return 'active';
          }

          return primary ? 'actionPrimary' : 'action';
        }),
    );
  }

  renderTabIndex(): Observable<number> {
    return this.disabledObs.pipe(map(disabled => disabled ? -1 : 0));
  }
}
