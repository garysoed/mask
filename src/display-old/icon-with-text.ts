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

import { instanceofType } from 'gs-types';
import { attributeIn, attributeOut, classlist, element, host, PersonaContext, stringParser, textContent } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { _p } from '../app/app';
import { $icon, Icon } from '../display/icon';
import { ThemedCustomElementCtrl } from '../theme/themed-custom-element-ctrl';

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
  host: host($$.api),
  icon: element('icon', $icon, {
    classes: classlist(),
    icon: attributeOut('icon', stringParser()),
    mode: attributeOut('mode', stringParser()),
  }),
  text: element('text', instanceofType(HTMLDivElement), {
    classes: classlist(),
    text: textContent(),
  }),
};

@_p.customElement({
  ...$$,
  dependencies: [Icon],
  template: iconWithTextTemplate,
})
export class IconWithText extends ThemedCustomElementCtrl {
  private readonly iconLigatureObs = this.declareInput($.host._.icon);
  private readonly iconObs = this.declareInput($.host._.icon);
  private readonly labelObs = this.declareInput($.host._.label);
  private readonly modeObs = this.declareInput($.host._.mode);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.text._.text, this.labelObs);
    this.render($.icon._.icon, this.iconObs);
    this.render($.icon._.mode, this.modeObs);
    this.render($.icon._.classes, this.renderIconClasses());
    this.render($.text._.classes, this.renderTextClasses());
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
