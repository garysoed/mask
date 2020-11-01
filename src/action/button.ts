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

import { AriaRole, PersonaContext, attributeOut, dispatcher, host, integerParser, noop, onDom, onKeydown, stringParser } from 'persona';
import { Observable, merge, of as observableOf } from 'rxjs';
import { cache } from 'gs-tools/export/data';
import { filter, map, throttleTime, withLatestFrom } from 'rxjs/operators';

import { ACTION_EVENT, ActionEvent } from '../event/action-event';
import { _p } from '../app/app';

import { $$ as $baseAction, BaseAction } from './base-action';
import template from './button.html';


const THROTTLE_MS = 500;

export const $button = {
  tag: 'mk-button',
  api: {
    ...$baseAction.api,
    // TODO: Add autocomplete option.
    actionEvent: dispatcher(ACTION_EVENT),
    tabindex: attributeOut('tabindex', integerParser()),
  },
};

export const $ = {
  host: host({
    ...$button.api,
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
  private get tabIndex$(): Observable<number> {
    return this.disabled$.pipe(map(disabled => disabled ? -1 : 0));
  }
}
