import {cache} from 'gs-tools/export/data';
import {enumType, Type} from 'gs-types';
import {Context, Ctrl, iattr, itarget, KBD, ocase, oforeach, otext, query, registerCustomElement, renderFragment, RenderSpec, renderTemplate, renderTextNode, root, TEMPLATE} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {ThemeLoader} from '../theme/loader/theme-loader';
import {renderTheme} from '../theme/render-theme';

import template from './keyboard.html';


const $keyboard = {
  host: {
    text: iattr('text'),
  },
  shadow: {
    _key: query('#_key', TEMPLATE, {
      target: itarget(),
    }),
    root: root({
      theme: ocase<ThemeLoader>('#theme'),
    }),
    description: query('#description', KBD, {
      content: oforeach<readonly [string, number]>('#content', ([v]) => v),
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

class Keyboard implements Ctrl {
  constructor(private readonly $: Context<typeof $keyboard>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$, this.$.shadow.root.theme),
      this.$.host.text.pipe(
          map(keyStr => (keyStr ?? '').split(' ').map((value, index) => [value, index] as const)),
          this.$.shadow.description.content(
              map(([value, index]) => this.renderSegment(value, index)),
          ),
      ),
    ];
  }

  private renderKey(key: string): RenderSpec {
    return renderTemplate({
      template$: this.$.shadow._key.target,
      spec: {
        kbd: query('kbd', KBD, {
          text: otext(),
        }),
      },
      runs: $ => [of(keyToString(key)).pipe($.kbd.text())],
    });
  }

  private renderSegment(keyStr: string, index: number): RenderSpec {
    if (index <= 0) {
      return this.renderKey(keyStr);
    }
    return renderFragment({
      nodes: [
        renderTextNode({textContent: of('+')}),
        this.renderKey(keyStr),
      ],
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