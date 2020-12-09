import {cache} from 'gs-tools/export/data';
import {enumType, Type} from 'gs-types';
import {host, multi, PersonaContext, RenderSpec, RenderSpecType, root, textIn} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../app/app';
import {BaseThemedCtrl} from '../theme/base-themed-ctrl';

import template from './keyboard.html';


export const $keyboard = {
  tag: 'mk-keyboard',
  api: {
    text: textIn(),
  },
};

export const $ = {
  host: host($keyboard.api),
  root: root({
    content: multi('#content'),
  }),
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

@_p.customElement({
  ...$keyboard,
  template,
})
export class Keyboard extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.content(this.keyboardSegments$),
    ];
  }

  @cache()
  private get keyboardSegments$(): Observable<readonly RenderSpec[]> {
    const children$ = this.inputs.host.text.pipe(
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
            keyNode$list.push({type: RenderSpecType.TEXT_NODE, text: '+', id: {}});
            keyNode$list.push(this.renderKey(key));
          }

          return keyNode$list;
        }),
    );

    return observableOf([{
      type: RenderSpecType.ELEMENT,
      tag: 'kbd',
      children: children$,
      id: {},
    }]);
  }

  private renderKey(key: string): RenderSpec {
    return {
      type: RenderSpecType.ELEMENT,
      tag: 'kbd',
      attrs: new Map([
        ['mk-theme-highlight', ''],
      ]),
      textContent: keyToString(key),
      id: {},
    };
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
