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

import { AriaRole, attributeIn, attributeOut, dispatcher, element, hasAttribute, host, integerParser, noop, onDom, onKeydown, PersonaContext, stringParser } from 'persona';
import { combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, startWith, throttleTime, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { $$ as $iconWithText, IconWithText } from '../display/icon-with-text';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

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
  host: host({
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
  ...$$,
  dependencies: [IconWithText],
  template: textButtonTemplate,
})
export class TextIconButton extends BaseAction {
  private readonly active$ = this.declareInput($.host._.active);
  private readonly ariaLabel$ = this.declareInput($.host._.ariaLabelIn);
  private readonly hasPrimary$ = this.declareInput($.host._.hasMkPrimary);
  private readonly icon$ = this.declareInput($.host._.icon);
  private readonly label$ = this.declareInput($.host._.label);
  private readonly onBlur$ = this.declareInput($.host._.onBlur);
  private readonly onClick$ = this.declareInput($.host._.onClick);
  private readonly onEnterDown$ = this.declareInput($.host._.onEnterDown);
  private readonly onFocus$ = this.declareInput($.host._.onFocus);
  private readonly onMouseEnter$ = this.declareInput($.host._.onMouseEnter);
  private readonly onMouseLeave$ = this.declareInput($.host._.onMouseLeave);
  private readonly onSpaceDown$ = this.declareInput($.host._.onSpaceDown);

  constructor(context: PersonaContext) {
    super(noop(), context);

    this.render($.host._.role, observableOf(AriaRole.BUTTON));
    this.render($.host._.actionEvent, this.renderDispatchActions());
    this.render($.host._.ariaLabelOut, this.renderHostAriaLabel());
    this.render($.host._.tabindex, this.renderTabIndex());
    this.render($.iconWithText._.label, this.label$);
    this.render($.iconWithText._.icon, this.icon$);
    this.render($.iconWithText._.mode, this.renderIconMode());
  }

  private renderDispatchActions(): Observable<ActionEvent> {
    return merge(
            this.onClick$,
            this.onEnterDown$,
            this.onSpaceDown$,
        )
        .pipe(
            throttleTime(THROTTLE_MS),
            withLatestFrom(this.disabled$),
            filter(([, disabled]) => !disabled),
            map(() => new ActionEvent()),
        );
  }

  private renderHostAriaLabel(): Observable<string> {
    return combineLatest([this.ariaLabel$, this.label$])
        .pipe(
            map(([hostAriaLabel, hostLabel]) => hostAriaLabel || hostLabel),
            distinctUntilChanged(),
        );
  }

  private renderIconMode(): Observable<string> {
    const hoverObs = merge(
        this.onMouseEnter$.pipe(mapTo(true)),
        this.onMouseLeave$.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    const focusedObs = merge(
        this.onFocus$.pipe(mapTo(true)),
        this.onBlur$.pipe(mapTo(false)),
    )
    .pipe(startWith(false));

    return combineLatest([
      this.active$,
      this.disabled$,
      focusedObs,
      hoverObs,
      this.hasPrimary$,
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
