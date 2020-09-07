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

import { cache } from 'gs-tools/export/data';
import { AriaRole, attributeIn, attributeOut, dispatcher, element, hasAttribute, host, integerParser, noop, onDom, onKeydown, PersonaContext, stringParser } from 'persona';
import { combineLatest, merge, Observable, of as observableOf } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, startWith, throttleTime, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { $$ as $iconWithText, IconWithText } from '../display/icon-with-text';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

import { $$ as $baseAction, BaseAction } from './base-action';
import textButtonTemplate from './text-icon-button.html';


const THROTTLE_MS = 500;

export const $button = {
  tag: 'mk-button',
  api: {
    ...$baseAction.api,
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
    ...$button.api,
    onBlur: onDom('blur'),
    onClick: onDom('click'),
    onEnterDown: onKeydown('Enter'),
    onFocus: onDom('focus'),
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
    onSpaceDown: onKeydown(' '),
    role: attributeOut('role', stringParser()),
  }),
};

@_p.customElement({
  ...$button,
  template: textButtonTemplate,
})
export class TextIconButton extends BaseAction {
  private readonly ariaLabel$ = this.declareInput($.host._.ariaLabelIn);
  private readonly label$ = this.declareInput($.host._.label);
  private readonly onClick$ = this.declareInput($.host._.onClick);
  private readonly onEnterDown$ = this.declareInput($.host._.onEnterDown);
  private readonly onSpaceDown$ = this.declareInput($.host._.onSpaceDown);

  constructor(context: PersonaContext) {
    super(noop(), context);

    this.render($.host._.role, observableOf(AriaRole.BUTTON));
    this.render($.host._.actionEvent, this.onAction$);
    this.render($.host._.ariaLabelOut, this.hostAriaLabel$);
    this.render($.host._.tabindex, this.tabIndex$);
  }

  @cache()
  private get onAction$(): Observable<ActionEvent<void>> {
    return merge(
            this.onClick$,
            this.onEnterDown$,
            this.onSpaceDown$,
        )
        .pipe(
            throttleTime(THROTTLE_MS),
            withLatestFrom(this.disabled$),
            filter(([, disabled]) => !disabled),
            map(() => new ActionEvent(undefined)),
        );
  }

  @cache()
  private get hostAriaLabel$(): Observable<string> {
    return combineLatest([this.ariaLabel$, this.label$])
        .pipe(
            map(([hostAriaLabel, hostLabel]) => hostAriaLabel || hostLabel),
            distinctUntilChanged(),
        );
  }

  @cache()
  private get tabIndex$(): Observable<number> {
    return this.disabled$.pipe(map(disabled => disabled ? -1 : 0));
  }
}
