import {cache} from 'gs-tools/export/data';
import {Bindings, Context, Ctrl, iflag, oattr, oevent, oflag} from 'persona';
import {IFlag, OEvent, Resolved, Spec} from 'persona/export/internal';
import {merge, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../event/action-event';


export interface BaseActionSpecType<T> extends Spec {
  host: {
    readonly disabled: Resolved<IFlag>;
    readonly isSecondary: Resolved<IFlag>;
    readonly actionEvent: Resolved<OEvent<ActionEvent<T>>>;
  };
}

export function create$baseAction<T>(): BaseActionSpecType<T> {
  return {
    host: {
      disabled: iflag('mk-disabled'),
      isSecondary: iflag('is-secondary'),
      actionEvent: oevent(ACTION_EVENT, ActionEvent),
    },
  };
}

export const $baseRootOutputs = {
  ariaDisabled: oattr('aria-disabled'),
  action1: oflag('mk-action-1'),
  action2: oflag('mk-action-2'),
  mkDisabled: oflag('mk-disabled'),
};


export abstract class BaseAction<T> implements Ctrl {
  constructor(
      protected readonly actionContext: Context<BaseActionSpecType<T>>,
      protected readonly renderDomDisabled: () => OperatorFunction<boolean, unknown>,
      protected readonly rootBindings: Bindings<typeof $baseRootOutputs>,
  ) {
  }

  abstract get onAction$(): Observable<ActionEvent<T>>;

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.ariaDisabled$.pipe(this.rootBindings.ariaDisabled()),
      this.actionContext.host.isSecondary.pipe(
          map(isSecondary => !isSecondary),
          this.rootBindings.action1(),
      ),
      this.onAction$.pipe(this.actionContext.host.actionEvent()),
      this.actionContext.host.isSecondary.pipe(this.rootBindings.action2()),
      this.renderDisabledDomOutput$,
    ];
  }

  @cache()
  private get ariaDisabled$(): Observable<string> {
    return this.actionContext.host.disabled.pipe(map(v => v ? 'true' : 'false'));
  }

  @cache()
  protected get disabled$(): Observable<boolean> {
    return this.actionContext.host.disabled;
  }

  @cache()
  private get renderDisabledDomOutput$(): Observable<unknown> {
    return merge(
        this.actionContext.host.disabled.pipe(this.renderDomDisabled()),
        this.actionContext.host.disabled.pipe(this.rootBindings.mkDisabled()),
    );
  }
}
