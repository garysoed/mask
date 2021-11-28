import {cache} from 'gs-tools/export/data';
import {Bindings, Context, Ctrl, iflag, oattr} from 'persona';
import {oflag} from 'persona/src-next/output/flag';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';


export const $baseAction = {
  host: {
    disabled: iflag('mk-disabled'),
    isSecondary: iflag('is-secondary'),
  },
};

export const $baseRootOutputs = {
  ariaDisabled: oattr('aria-disabled'),
  action1: oflag('mk-action-1'),
  action2: oflag('mk-action-2'),
};


export abstract class BaseAction implements Ctrl {
  constructor(
      protected readonly $: Context<typeof $baseAction>,
      protected readonly renderDisabled: () => OperatorFunction<boolean, unknown>,
      protected readonly rootBindings: Bindings<typeof $baseRootOutputs>,
  ) {
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.ariaDisabled$.pipe(this.rootBindings.ariaDisabled()),
      this.$.host.isSecondary.pipe(
          map(isSecondary => !isSecondary),
          this.rootBindings.action1(),
      ),
      this.$.host.isSecondary.pipe(this.rootBindings.action2()),
      this.renderDisabledDomOutput$,
    ];
  }

  @cache()
  private get ariaDisabled$(): Observable<string> {
    return this.$.host.disabled.pipe(map(v => v ? 'true' : 'false'));
  }

  @cache()
  protected get disabled$(): Observable<boolean> {
    return this.$.host.disabled;
  }

  @cache()
  private get renderDisabledDomOutput$(): Observable<unknown> {
    return this.$.host.disabled.pipe(this.renderDisabled());
  }
}
