import {cache} from 'gs-tools/export/data';
import {Context, Ctrl, DIV, query, registerCustomElement} from 'persona';
import {oflag} from 'persona/src/output/flag';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerSvg} from '../../src/core/svg-service';
import {FitTo, ICON} from '../../src/display/icon';
import {CHECKBOX} from '../../src/input/checkbox';
import {renderTheme} from '../../src/theme/render-theme';
import fitToHeightSvg from '../asset/fit_to_height.svg';
import {DEMO_LAYOUT} from '../core/demo-layout';
import {$demoState} from '../core/demo-state';
import {bindInputToState} from '../util/bind-input-to-state';

import template from './icon.html';


const $iconDemo = {
  shadow: {
    fitToWidthCheckbox: query('#fitToWidthCheckbox', CHECKBOX),
    icon: query('#icon', ICON),
    iconContainer: query('#iconContainer', DIV, {
      action: oflag('mk-action-2'),
    }),
    isActionCheckbox: query('#isActionCheckbox', CHECKBOX),
  },
};

export class IconDemo implements Ctrl {
  private readonly $state = $demoState.get(this.$.vine)._('iconDemo');

  constructor(private readonly $: Context<typeof $iconDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.isAction$.pipe(this.$.shadow.iconContainer.action()),
      this.fitTo$.pipe(this.$.shadow.icon.fitTo()),
      bindInputToState(this.$state.$('fitToWidth'), this.$.shadow.fitToWidthCheckbox),
      bindInputToState(this.$state.$('isAction'), this.$.shadow.isActionCheckbox),
    ];
  }

  @cache()
  private get isAction$(): Observable<boolean> {
    return $demoState.get(this.$.vine)._('iconDemo').$('isAction').pipe(
        map(isAction => !!isAction && isAction !== null),
    );
  }

  @cache()
  private get fitTo$(): Observable<FitTo> {
    return $demoState.get(this.$.vine)._('iconDemo').$('fitToWidth').pipe(
        map(fitToWidth => {
          if (!fitToWidth) {
            return FitTo.HEIGHT;
          }

          return FitTo.WIDTH;
        }),
    );
  }
}

export const ICON_DEMO = registerCustomElement({
  configure: vine => {
    registerSvg(vine, 'fit_to_height', {type: 'embed', content: fitToHeightSvg});
  },
  ctrl: IconDemo,
  deps: [
    CHECKBOX,
    DEMO_LAYOUT,
    ICON,
  ],
  spec: $iconDemo,
  tag: 'mkd-icon',
  template,
});