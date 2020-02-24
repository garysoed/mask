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

import { Vine } from 'grapevine';
import { AriaRole, attributeIn, attributeOut, dispatcher, element, hasAttribute, noop, onDom, onKeydown } from 'persona';
import { combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, startWith, throttleTime, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { $$ as $iconWithText, IconWithText } from '../display/icon-with-text';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { integerParser, stringParser } from '../util/parsers';

import { BaseAction } from './base-action';
import textButtonTemplate from './text-icon-button.html';


const THROTTLE_MS = 500;

export const $$ = {
  tag: 'mk-text-icon-button',
  api: {
    // TODO: Add autocomplete option.
    actionEvent: dispatcher(ACTION_EVENT),
    active: hasAttribute('active'),
    ariaLabelIn: attributeIn('aria-label', stringParser(), ''),
    ariaLabelOut: attributeOut('aria-label', stringParser()),
    disabled: hasAttribute('disabled'),
    hasMkPrimary: hasAttribute('mk-primary'),
    icon: attributeIn('icon', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    tabindex: attributeOut('tabindex', integerParser()),
  },
};

export const $ = {
  host: element({
    ...$$.api,
    onBlur: onDom('blur'),
    onClick: onDom('click'),
    onEnterDown: onKeydown('Enter'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
    onSpaceDown: onKeydown(' '),
    role: attributeOut('role', stringParser()),
  }),
  iconWithText: element('iconWithText', $iconWithText, {
    icon: attributeOut('icon', stringParser()),
    label: attributeOut('label', stringParser()),
    mode: attributeOut('mode', stringParser()),
  }),
};

@_p.customElement({
  dependencies: [IconWithText],
  tag: $$.tag,
  template: textButtonTemplate,
})
export class TextIconButton extends BaseAction {
  private readonly activeObs = this.declareInput($.host._.active);
  private readonly ariaLabelObs = this.declareInput($.host._.ariaLabelIn);
  private readonly hasPrimaryObs = this.declareInput($.host._.hasMkPrimary);
  private readonly iconObs = this.declareInput($.host._.icon);
  private readonly labelObs = this.declareInput($.host._.label);
  private readonly onBlurObs = this.declareInput($.host._.onBlur);
  private readonly onClickObs = this.declareInput($.host._.onClick);
  private readonly onEnterDownObs = this.declareInput($.host._.onEnterDown);
  private readonly onFocusObs = this.declareInput($.host._.onFocus);
  private readonly onMouseEnterObs = this.declareInput($.host._.onMouseEnter);
  private readonly onMouseLeaveObs = this.declareInput($.host._.onMouseLeave);
  private readonly onSpaceDownObs = this.declareInput($.host._.onSpaceDown);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(
        noop(),
        shadowRoot,
        vine,
    );

    this.render($.host._.role).withObservable(observableOf(AriaRole.BUTTON));
    this.render($.host._.actionEvent).withFunction(this.renderDispatchActions);
    this.render($.host._.ariaLabelOut).withFunction(this.renderHostAriaLabel);
    this.render($.host._.tabindex).withFunction(this.renderTabIndex);
    this.render($.iconWithText._.label).withObservable(this.labelObs);
    this.render($.iconWithText._.icon).withObservable(this.iconObs);
    this.render($.iconWithText._.mode).withFunction(this.renderIconMode);
  }

  private renderDispatchActions(): Observable<ActionEvent> {
    return merge(
            this.onClickObs,
            this.onEnterDownObs,
            this.onSpaceDownObs,
        )
        .pipe(
            throttleTime(THROTTLE_MS),
            withLatestFrom(this.disabled$),
            filter(([, disabled]) => !disabled),
            map(() => new ActionEvent()),
        );
  }

  private renderHostAriaLabel(): Observable<string> {
    return combineLatest([this.ariaLabelObs, this.labelObs])
        .pipe(map(([hostAriaLabel, hostLabel]) => hostAriaLabel || hostLabel));
  }

  private renderIconMode(): Observable<string> {
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

    return combineLatest([
      this.activeObs,
      this.disabled$,
      focusedObs,
      hoverObs,
      this.hasPrimaryObs,
    ])
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

  private renderTabIndex(): Observable<number> {
    return this.disabled$.pipe(map(disabled => disabled ? -1 : 0));
  }
}
