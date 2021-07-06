import {Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$div, $input, attributeIn, attributeOut, classToggle, dispatcher, element, host, integerParser, onDom, onInput, PersonaContext, setAttribute} from 'persona';
import {defer, merge, Observable, of as observableOf} from 'rxjs';
import {map, mapTo, startWith} from 'rxjs/operators';

import {_p} from '../../app/app';
import stepper from '../../asset/stepper.svg';
import {objectPathParser} from '../../core/object-path-parser';
import {registerSvg} from '../../core/svg-service';
import {$icon, Icon} from '../../display/icon';
import {CHANGE_EVENT} from '../../event/change-event';
import {LineLayout} from '../../layout/line-layout';

import {$baseInput as $baseInput, BaseInput, STATE_ID_ATTR_NAME} from './base-input';
import template from './number-input.html';


export const $numberInput = {
  api: {
    ...$baseInput.api,
    max: attributeIn('max', integerParser()),
    min: attributeIn('min', integerParser()),
    onChange: dispatcher(CHANGE_EVENT),
    stateId: attributeIn(STATE_ID_ATTR_NAME, objectPathParser<number>()),
    step: attributeIn('step', integerParser()),
  },
  tag: 'mk-number-input',
};

export const $ = {
  host: host($numberInput.api),
  icon: element('icon', $icon, {
    hiddenClass: classToggle('hidden'),
  }),
  input: element('input', $input, {
    disabled: setAttribute('disabled'),
    max: attributeOut('max', integerParser()),
    min: attributeOut('min', integerParser()),
    onInput: onInput(),
    step: attributeOut('step', integerParser()),
  }),
  root: element('root', $div, {
    onMouseEnter: onDom('mouseenter'),
    onMouseLeave: onDom('mouseleave'),
  }),
};

@_p.customElement({
  ...$numberInput,
  dependencies: [
    Icon,
    LineLayout,
  ],
  template,
  configure(vine: Vine): void {
    registerSvg(
        vine,
        'mk.numberinput_stepper',
        {type: 'embed', content: stepper},
    );
  },
})
export class NumberInput extends BaseInput<number, typeof $> {
  constructor(context: PersonaContext) {
    super(
        0,
        $.input._.disabled,
        $.host._.stateId,
        $.host._.onChange,
        context,
        $,
        $.host._,
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.renders,
      this.renderers.icon.hiddenClass(this.hideStepperIcon),
      this.renderers.input.max(this.inputs.host.max),
      this.renderers.input.min(this.inputs.host.min),
      this.renderers.input.step(this.inputs.host.step),
    ];
  }

  @cache()
  protected get domValue$(): Observable<number> {
    const el = $.input.getSelectable(this.context);
    return merge(this.inputs.input.onInput, this.onDomValueUpdatedByScript$)
        .pipe(
            startWith({}),
            map(() => Number.parseInt(el.value, 10)),
        );
  }

  @cache()
  protected get hideStepperIcon(): Observable<boolean> {
    return merge(
        this.inputs.root.onMouseEnter.pipe(mapTo(false)),
        this.inputs.root.onMouseLeave.pipe(mapTo(true)),
    )
        .pipe(startWith(true));
  }

  protected updateDomValue(newValue: number): Observable<unknown> {
    return defer(() => {
      const el = $.input.getSelectable(this.context);
      el.value = `${newValue}`;

      return observableOf({});
    });
  }
}
