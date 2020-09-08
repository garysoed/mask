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
import { AriaRole, attributeOut, dispatcher, hasAttribute, host, integerParser, noop, onDom, onKeydown, PersonaContext, setAttribute, stringParser } from 'persona';
import { merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, throttleTime, withLatestFrom } from 'rxjs/operators';

import { _p } from '../app/app';
import { ACTION_EVENT, ActionEvent } from '../event/action-event';

import { $$ as $baseAction, BaseAction } from './base-action';
import template from './button.html';


const THROTTLE_MS = 500;

export const $button = {
  tag: 'mk-button',
  api: {
    ...$baseAction.api,
    // TODO: Add autocomplete option.
    actionEvent: dispatcher(ACTION_EVENT),
    isSecondary: hasAttribute('is-secondary'),
    tabindex: attributeOut('tabindex', integerParser()),
  },
};

export const $ = {
  host: host({
    ...$button.api,
    action1: setAttribute('mk-action-1'),
    action2: setAttribute('mk-action-2'),
    onClick: onDom('click'),
    onEnterDown: onKeydown('Enter'),
    onSpaceDown: onKeydown(' '),
    role: attributeOut('role', stringParser()),
  }),
};

@_p.customElement({
  ...$button,
  template,
})
export class Button extends BaseAction {
  constructor(context: PersonaContext) {
    super(noop(), context);

    this.render($.host._.role, observableOf(AriaRole.BUTTON));
    this.render($.host._.actionEvent, this.onAction$);
    this.render($.host._.tabindex, this.tabIndex$);
    this.render($.host._.action1, this.isSecondaryAction$.pipe(map(isSecondary => !isSecondary)));
    this.render($.host._.action2, this.isSecondaryAction$);
  }

  @cache()
  private get onAction$(): Observable<ActionEvent<void>> {
    return merge(
            this.declareInput($.host._.onClick),
            this.declareInput($.host._.onEnterDown),
            this.declareInput($.host._.onSpaceDown),
        )
        .pipe(
            throttleTime(THROTTLE_MS),
            withLatestFrom(this.disabled$),
            filter(([, disabled]) => !disabled),
            map(() => new ActionEvent(undefined)),
        );
  }

  @cache()
  private get isSecondaryAction$(): Observable<boolean> {
    return this.declareInput($.host._.isSecondary);
  }

  @cache()
  private get tabIndex$(): Observable<number> {
    return this.disabled$.pipe(map(disabled => disabled ? -1 : 0));
  }
}
