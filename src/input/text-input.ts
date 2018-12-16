import { VineImpl } from 'grapevine/export/main';
import { BooleanType, InstanceofType, StringType } from 'gs-types/export';
import { attributeIn, attributeOut, dispatcher, element, resolveLocators, shadowHost } from 'persona/export/locator';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import { debounceTime, map, startWith, switchMap, take } from 'rxjs/operators';
import { _p } from '../app/app';
import { Config } from '../app/config';
import { ChangeEvent } from '../event/change-event';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { booleanParser, stringParser } from '../util/parsers';
import textInputTemplate from './text-input.html';

const DEBOUNCE_MS = 250;

export const $ = resolveLocators({
  host: {
    disabled: attributeIn(shadowHost, 'disabled', booleanParser(), BooleanType, false),
    dispatch: dispatcher(shadowHost),
    initValue: attributeIn(shadowHost, 'init-value', stringParser(), StringType, ''),
  },
  input: {
    disabled: attributeOut(
        element('input.el'),
        'disabled',
        booleanParser(),
        BooleanType,
        value => !value,
    ),
    el: element('#input', InstanceofType(HTMLInputElement)),
  },
});

@_p.customElement({
  tag: 'mk-text-input',
  template: textInputTemplate,
  watch: [
    $.host.dispatch,
    $.host.initValue,
    $.input.el,
  ],
})
@_p.render($.input.disabled).withForwarding($.host.disabled)
class TextInput extends ThemedCustomElementCtrl {
  init(vine: VineImpl): void {
    super.init(vine);

    this.addSubscription(
        combineLatest(
            vine.getObservable($.host.initValue.getReadingId(), this),
            vine.getObservable($.input.el.getReadingId(), this),
        )
        .pipe(take(1))
        .subscribe(([initValue, inputEl]) => {
          inputEl.value = initValue;
        }),
    );

    this.addSubscription(
        combineLatest(
            createValueObs(vine.getObservable($.input.el.getReadingId(), this)),
            vine.getObservable($.host.dispatch.getReadingId(), this),
        )
        .subscribe(([value, dispatch]) => {
          dispatch(new ChangeEvent(value));
        }),
    );
  }
}

function createValueObs(inputElObs: Observable<HTMLInputElement>): Observable<string> {
  return inputElObs
      .pipe(
          switchMap(inputEl => {
            return fromEvent(inputEl, 'input')
                .pipe(
                    map(() => inputEl.value),
                    startWith(inputEl.value),
                    debounceTime(DEBOUNCE_MS),
                );
          }),
      );
}

export function textInput(): Config {
  return {tag: 'mk-text-input'};
}
