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

import {cache} from 'gs-tools/export/data';
import {AriaRole, PersonaContext, attributeOut, dispatcher, host, integerParser, noop, onDom, onKeydown, stringParser, ValuesOf} from 'persona';
import {Observable, merge, of as observableOf} from 'rxjs';
import {filter, map, throttleTime, withLatestFrom} from 'rxjs/operators';

import {_p} from '../app/app';
import {ACTION_EVENT, ActionEvent} from '../event/action-event';

import {$baseAction as $baseAction, BaseAction} from './base-action';
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
export class Button extends BaseAction<typeof $> {
  constructor(context: PersonaContext) {
    super(noop(), context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      host: {
        ...this.baseActionValues,
        role: observableOf(AriaRole.BUTTON),
        actionEvent: this.onAction$,
        tabindex: this.tabIndex$,
      },
    };
  }

  @cache()
  private get onAction$(): Observable<ActionEvent<void>> {
    return merge(
        this.inputs.host.onClick,
        this.inputs.host.onEnterDown,
        this.inputs.host.onSpaceDown,
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
