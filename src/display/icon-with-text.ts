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

import { Vine } from 'grapevine';
import { InstanceofType } from 'gs-types';
import { attributeIn, attributeOut, classlist, element, stringParser, textContent } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

import { $$ as $icon, Icon } from './icon';
import iconWithTextTemplate from './icon-with-text.html';


export const $$ = {
  api: {
    icon: attributeIn('icon', stringParser(), ''),
    label: attributeIn('label', stringParser(), ''),
    mode: attributeIn('mode', stringParser(), ''),
  },
  tag: 'mk-icon-with-text',
};

export const $ = {
  host: element($$.api),
  icon: element('icon', $icon, {
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
  tag: $$.tag,
  template: iconWithTextTemplate,
})
export class IconWithText extends ThemedCustomElementCtrl {
  private readonly iconLigatureObs = this.declareInput($.host._.icon);
  private readonly iconObs = this.declareInput($.host._.icon);
  private readonly labelObs = this.declareInput($.host._.label);
  private readonly modeObs = this.declareInput($.host._.mode);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.render($.text._.text).withObservable(this.labelObs);
    this.render($.icon._.icon).withObservable(this.iconObs);
    this.render($.icon._.mode).withObservable(this.modeObs);
    this.render($.icon._.classes).withFunction(this.renderIconClasses);
    this.render($.text._.classes).withFunction(this.renderTextClasses);
  }

  private renderIconClasses(): Observable<ReadonlySet<string>> {
    return this.iconLigatureObs.pipe(
        map(iconLigature => {
          if (!iconLigature) {
            return new Set();
          }

          return new Set(['hasIcon']);
        }),
    );
  }

  private renderTextClasses(): Observable<ReadonlySet<string>> {
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
