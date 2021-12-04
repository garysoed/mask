import {cache} from 'gs-tools/export/data';
import {Context, id, ievent, oattr, oevent, registerCustomElement, BUTTON as HTML_BUTTON, ikeydown} from 'persona';
import {merge, Observable} from 'rxjs';
import {filter, map, throttleTime, withLatestFrom} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../event/action-event';
import {renderTheme} from '../theme/render-theme';

import {create$baseAction, $baseRootOutputs, BaseAction} from './base-action';
import template from './button.html';


const THROTTLE_MS = 500;

const $button = {
  host: {
    ...create$baseAction().host,
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
  constructor(protected readonly actionContext: Context<typeof $button>) {
    super(
        actionContext,
        actionContext.shadow.rootEl.disabled,
        actionContext.shadow.rootEl,
    );
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      renderTheme(this.actionContext),
      this.onAction$.pipe(this.actionContext.host.actionEvent()),
      this.tabIndex$.pipe(
          map(index => `${index}`),
          this.actionContext.shadow.rootEl.tabindex(),
      ),
    ];
  }

  @cache()
  private get onAction$(): Observable<ActionEvent<void>> {
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
