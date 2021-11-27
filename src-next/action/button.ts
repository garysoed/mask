import {cache} from 'gs-tools/export/data';
import {Context, id, ievent, oattr, oevent, registerCustomElement, BUTTON as HTML_BUTTON, ikeydown} from 'persona';
import {merge, Observable} from 'rxjs';
import {filter, map, throttleTime, withLatestFrom} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../event/action-event';

import {$baseAction, $baseRootOutputs, BaseAction} from './base-action';
import template from './button.html';


const THROTTLE_MS = 500;

const $button = {
  host: {
    ...$baseAction.host,
    actionEvent: oevent(ACTION_EVENT),
  },
  shadow: {
    rootEl: id('root', HTML_BUTTON, {
      ...$baseRootOutputs,
      onClick: ievent('click'),
      onEnterDown: ikeydown('Enter'),
      onSpaceDown: ikeydown(' '),
      role: oattr('role'),
      tabindex: oattr('tabindex'),
    }),
  },
};


class Button extends BaseAction {
  constructor(protected readonly $: Context<typeof $button>) {
    super(
        $,
        $.shadow.rootEl.disabled,
        $.shadow.rootEl,
    );
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.onAction$.pipe(this.$.host.actionEvent()),
      this.tabIndex$.pipe(
          map(index => `${index}`),
          this.$.shadow.rootEl.tabindex(),
      ),
    ];
  }

  @cache()
  private get onAction$(): Observable<ActionEvent<void>> {
    return merge(
        this.$.shadow.rootEl.onClick,
        this.$.shadow.rootEl.onEnterDown,
        this.$.shadow.rootEl.onSpaceDown,
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

export const BUTTON = registerCustomElement({
  tag: 'mk-button',
  ctrl: Button,
  spec: $button,
  template,
});
