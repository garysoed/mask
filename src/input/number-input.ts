import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {nullType, numberType, unionType} from 'gs-types';
import {Context, DIV, iattr, id, ievent, INPUT, itarget, oclass, oevent, oflag, registerCustomElement} from 'persona';
import {merge, Observable, OperatorFunction, pipe, Subject} from 'rxjs';
import {map, mapTo, startWith, tap, withLatestFrom} from 'rxjs/operators';

import {$baseRootOutputs} from '../action/base-action';
import stepper from '../asset/stepper.svg';
import {registerSvg} from '../core/svg-service';
import {ICON} from '../display/icon';
import {ActionEvent} from '../event/action-event';
import {ChangeEvent, CHANGE_EVENT} from '../event/change-event';
import {LINE_LAYOUT} from '../layout/line-layout';
import {renderTheme} from '../theme/render-theme';

import {BaseInput, create$baseInput} from './base-input';
import template from './number-input.html';


const $numberInput = {
  host: {
    ...create$baseInput<number|null, number|null>(unionType([numberType, nullType]), null).host,
    max: iattr('max'),
    min: iattr('min'),
    onChange: oevent(CHANGE_EVENT, ChangeEvent),
    step: iattr('step'),
  },
  shadow: {
    icon: id('icon', ICON, {
      hiddenClass: oclass('hidden'),
    }),
    input: id('input', INPUT, {
      disabled: oflag('disabled'),
      element: itarget(),
      onChange: ievent('change', Event),
    }),
    root: id('root', DIV, {
      ...$baseRootOutputs,
      onMouseEnter: ievent('mouseenter', MouseEvent),
      onMouseLeave: ievent('mouseleave', MouseEvent),
    }),
  },
};


export class NumberInput extends BaseInput<number|null, number|null> {
  private readonly onDomValueUpdated$ = new Subject<void>();

  constructor(private readonly $: Context<typeof $numberInput>) {
    super($, $.shadow.input.disabled, $.shadow.root);
  }

  @cache()
  get onAction$(): Observable<ActionEvent<number|null>> {
    return this.domValue$.pipe(map(value => new ActionEvent(value)));
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      renderTheme(this.$),
      this.hideStepperIcon$.pipe(this.$.shadow.icon.hiddenClass()),
      this.$.host.max.pipe(this.$.shadow.input.max()),
      this.$.host.min.pipe(this.$.shadow.input.min()),
      this.$.host.step.pipe(this.$.shadow.input.step()),
    ];
  }

  @cache()
  protected get domValue$(): Observable<number> {
    return merge(
        this.$.shadow.input.onChange,
        this.onDomValueUpdated$,
    )
        .pipe(
            startWith({}),
            withLatestFrom(this.$.shadow.input.element),
            map(([, el]) => {
              if (!(el instanceof HTMLInputElement)) {
                throw new Error('Element is not an HTMLInputElement');
              }
              return el.value;
            }),
            map(value => Number.parseInt(value, 10)),
        );
  }

  @cache()
  protected get hideStepperIcon$(): Observable<boolean> {
    return merge(
        this.$.shadow.root.onMouseEnter.pipe(mapTo(false)),
        this.$.shadow.root.onMouseLeave.pipe(mapTo(true)),
    )
        .pipe(startWith(true));
  }

  protected updateDomValue(): OperatorFunction<number|null, unknown> {
    return pipe(
        withLatestFrom(this.$.shadow.input.element),
        tap(([newValue, element]) => {
          if (!(element instanceof HTMLInputElement)) {
            throw new Error('Element is not an HTMLInputElement');
          }

          if (newValue === null) {
            element.value = '';
          } else {
            element.value = `${newValue}`;
          }

          this.onDomValueUpdated$.next();
        }),
    );
  }
}

export const NUMBER_INPUT = registerCustomElement({
  ctrl: NumberInput,
  deps: [
    ICON,
    LINE_LAYOUT,
  ],
  spec: $numberInput,
  template,
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'mk.numberinput_stepper',
        {type: 'embed', content: stepper},
    );
  },
  tag: 'mk-number-input',
});
