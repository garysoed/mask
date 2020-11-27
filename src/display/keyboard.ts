import {cache} from 'gs-tools/export/data';
import {enumType, Type} from 'gs-types';
import {host, multi, NodeWithId, PersonaContext, renderElement, renderTextNode, root, textIn} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

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
  private get keyboardSegments$(): Observable<ReadonlyArray<NodeWithId<Node>>> {
    const children$ = this.inputs.host.text.pipe(
        map(keyStr => keyStr.split(' ')),
        switchMap(keys => {
          if (keys.length <= 0) {
            return observableOf([]);
          }

          const [firstKey, ...rest] = keys;
          const keyNode$list: Array<Observable<NodeWithId<Node>>> = [
            this.renderKey(firstKey),
          ];

          for (const key of rest) {
            keyNode$list.push(renderTextNode(observableOf('+'), {}, this.context));
            keyNode$list.push(this.renderKey(key));
          }

          return combineLatest(keyNode$list);
        }),
    );

    return renderElement('kbd', {children: children$}, {}, this.context).pipe(map(node => [node]));
  }

  private renderKey(key: string): Observable<NodeWithId<Node>> {
    return renderElement(
        'kbd',
        {
          attrs: new Map([
            ['mk-theme-highlight', observableOf('')],
          ]),
          textContent: observableOf(keyToString(key)),
        },
        {},
        this.context,
    );
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
