/**
 * @webcomponent mk-icon-with-text
 * Displays an icon using icon font and a text
 *
 * @attr {<string} icon Icon ligature.
 * @attr {<string} iconFamily Family of icons to use. This should correspond to the one registered
 *     in $registeredFonts.
 * @attr {<string} label Text to display
 * @slot The glyph of the icon to display.
 */

import { ElementWithTagType, InstanceofType } from '@gs-types';
import { attributeIn, attributeOut, classlist, element, InitFn, textContent } from '@persona';
import { Observable } from '@rxjs';
import { map } from '@rxjs/operators';

import { _p, _v } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';
import { stringParser } from '../util/parsers';

import { Icon } from './icon';
import iconWithTextTemplate from './icon-with-text.html';


export const $$ = {
  icon: attributeIn('icon', stringParser(), ''),
  label: attributeIn('label', stringParser(), ''),
  mode: attributeIn('mode', stringParser(), ''),
};

export const $ = {
  host: element($$),
  icon: element('icon', ElementWithTagType('mk-icon'), {
    classes: classlist(),
    icon: attributeOut('icon', stringParser()),
    mode: attributeOut('mode', stringParser()),
  }),
  text: element('text', InstanceofType(HTMLDivElement), {
    classes: classlist(),
    text: textContent(),
  }),
};

@_p.customElement({
  dependencies: [Icon],
  tag: 'mk-icon-with-text',
  template: iconWithTextTemplate,
})
export class IconWithText extends ThemedCustomElementCtrl {
  private readonly iconLigatureObs = _p.input($.host._.icon, this);
  private readonly iconObs = _p.input($.host._.icon, this);
  private readonly labelObs = _p.input($.host._.label, this);
  private readonly modeObs = _p.input($.host._.mode, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.text._.text).withObservable(this.labelObs),
      _p.render($.icon._.icon).withObservable(this.iconObs),
      _p.render($.icon._.mode).withObservable(this.modeObs),
      _p.render($.icon._.classes).withVine(_v.stream(this.renderIconClasses, this)),
      _p.render($.text._.classes).withVine(_v.stream(this.renderTextClasses, this)),
    ];
  }

  renderIconClasses(): Observable<ReadonlySet<string>> {
    return this.iconLigatureObs.pipe(
        map(iconLigature => {
          if (!iconLigature) {
            return new Set();
          }

          return new Set(['hasIcon']);
        }),
    );
  }

  renderTextClasses(): Observable<ReadonlySet<string>> {
    return this.labelObs.pipe(
        map(label => {
          if (!label) {
            return new Set();
          }

          return new Set(['hasText']);
        }),
    );
  }
}
