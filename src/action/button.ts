import {cache} from 'gs-tools/export/data';
import {BUTTON as HTML_BUTTON, Context, query, ievent, ikeydown, oattr, oflag, registerCustomElement, oevent} from 'persona';
import {merge, Observable} from 'rxjs';
import {filter, map, throttleTime, withLatestFrom} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../event/action-event';
import {renderTheme} from '../theme/render-theme';

import {$baseRootOutputs, BaseAction, create$baseAction} from './base-action';
import template from './button.html';


const THROTTLE_MS = 500;

const $button = {
  host: {
    ...create$baseAction().host,
    actionEvent: oevent(ACTION_EVENT, ActionEvent),
  },
  shadow: {
    rootEl: query('#root', HTML_BUTTON, {
      ...$baseRootOutputs,
      disabled: oflag('disabled'),
      onClick: ievent('click', MouseEvent),
      onEnterDown: ikeydown('Enter'),
      onSpaceDown: ikeydown(' '),
      role: oattr('role'),
      tabindex: oattr('tabindex'),
    }),
  },
};


class Button extends BaseAction {
  constructor(protected override readonly actionContext: Context<typeof $button>) {
    super(
        actionContext,
        actionContext.shadow.rootEl.disabled,
        actionContext.shadow.rootEl,
    );
  }

  @cache()
  override get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.onAction$.pipe(this.actionContext.host.actionEvent()),
      renderTheme(this.actionContext),
      this.tabIndex$.pipe(
          map(index => `${index}`),
          this.actionContext.shadow.rootEl.tabindex(),
      ),
    ];
  }

  @cache()
  get onAction$(): Observable<ActionEvent<undefined>> {
    return merge(
        this.actionContext.shadow.rootEl.onClick,
        this.actionContext.shadow.rootEl.onEnterDown,
        this.actionContext.shadow.rootEl.onSpaceDown,
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
