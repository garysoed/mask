import {cache} from 'gs-tools/export/data';
import {enumType, Type} from 'gs-types';
import {Context, Ctrl, itext, omulti, registerCustomElement, renderElement, RenderSpec, renderTextNode, root} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {renderTheme} from '../theme/render-theme';

import template from './keyboard.html';


const $keyboard = {
  host: {
    text: itext(),
  },
  shadow: {
    root: root({
      content: omulti('#content'),
    }),
  },
};

export enum SpecialKeys {
  ALT = 'alt',
  BACKSPACE = 'back',
  CAPSLOCK = 'caps',
  CTRL = 'ctrl',
  ENTER = 'enter',
  META = 'meta',
  OPTION = 'option',
  SHIFT = 'shift',
  TAB = 'tab',
}

const SPECIAL_KEYS_TYPE: Type<SpecialKeys> = enumType(SpecialKeys);

export class Keyboard implements Ctrl {
  constructor(private readonly $: Context<typeof $keyboard>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.keyboardSegments$.pipe(this.$.shadow.root.content()),
    ];
  }

  @cache()
  private get keyboardSegments$(): Observable<readonly RenderSpec[]> {
    const children$ = this.$.host.text.pipe(
        map(keyStr => keyStr.split(' ')),
        map(keys => {
          if (keys.length <= 0) {
            return [];
          }

          const [firstKey, ...rest] = keys;
          const keyNode$list: RenderSpec[] = [
            this.renderKey(firstKey),
          ];

          for (const key of rest) {
            keyNode$list.push(renderTextNode({textContent: '+', id: {}}));
            keyNode$list.push(this.renderKey(key));
          }

          return keyNode$list;
        }),
    );

    return observableOf([renderElement({
      tag: 'kbd',
      children: children$,
      id: {},
    })]);
  }

  private renderKey(key: string): RenderSpec {
    return renderElement({
      tag: 'kbd',
      attrs: new Map([
        ['mk-theme-highlight', ''],
      ]),
      textContent: keyToString(key),
      id: {},
    });
  }
}

function keyToString(key: string): string {
  if (!SPECIAL_KEYS_TYPE.check(key)) {
    return key;
  }

  switch (key) {
    case SpecialKeys.ALT:
      return '⎇ Alt';
    case SpecialKeys.BACKSPACE:
      return '← Backspace';
    case SpecialKeys.CAPSLOCK:
      return '⇪ Caps Lock';
    case SpecialKeys.CTRL:
      return 'Ctrl';
    case SpecialKeys.ENTER:
      return '↵ Enter';
    case SpecialKeys.META:
      return '⌘';
    case SpecialKeys.OPTION:
      return '⌥ Option';
    case SpecialKeys.SHIFT:
      return '⇧ Shift';
    case SpecialKeys.TAB:
      return '↹ Tab';
  }
}

export const KEYBOARD = registerCustomElement({
  ctrl: Keyboard,
  spec: $keyboard,
  tag: 'mk-keyboard',
  template,
});