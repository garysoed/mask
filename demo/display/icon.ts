import {mutablePathSource} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$div, element, PersonaContext, setAttribute} from 'persona';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {$checkbox, $icon, Icon as MaskIcon, registerSvg, _p} from '../../export';
import {FitTo} from '../../src/display/icon';
import {BaseThemedCtrl} from '../../src/theme/base-themed-ctrl';
import fitToHeightSvg from '../asset/fit_to_height.svg';
import {DemoLayout} from '../base/demo-layout';
import {$demoState, $demoStateId} from '../core/demo-state';

import template from './icon.html';


export const $iconDemo = {
  tag: 'mkd-icon',
  api: {},
};

const $ = {
  fitToWidthCheckbox: element('fitToWidthCheckbox', $checkbox, {}),
  icon: element('icon', $icon, {}),
  iconContainer: element('iconContainer', $div, {
    action: setAttribute('mk-action-2'),
  }),
  isActionCheckbox: element('isActionCheckbox', $checkbox, {}),
};

const isActionPath = mutablePathSource($demoStateId, demo => demo._('iconDemo')._('isAction'));
const fitToWidthPath = mutablePathSource($demoStateId, demo => demo._('iconDemo')._('fitToWidth'));

@_p.customElement({
  ...$iconDemo,
  dependencies: [
    DemoLayout,
    MaskIcon,
  ],
  template,
  configure: vine => {
    registerSvg(vine, 'fit_to_height', {type: 'embed', content: fitToHeightSvg});
  },
})
export class IconDemo extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.iconContainer.action(this.isAction$),
      this.renderers.icon.fitTo(this.fitTo$),
      this.renderers.fitToWidthCheckbox.stateId(of(fitToWidthPath.get(this.vine))),
      this.renderers.isActionCheckbox.stateId(of(isActionPath.get(this.vine))),
    ];
  }

  @cache()
  private get isAction$(): Observable<boolean> {
    return $demoState.get(this.vine)._('iconDemo').$('isAction').pipe(
        map(isAction => !!isAction && isAction !== 'unknown'),
    );
  }

  @cache()
  private get fitTo$(): Observable<FitTo> {
    return $demoState.get(this.vine)._('iconDemo').$('fitToWidth').pipe(
        map(fitToWidth => {
          if (!fitToWidth) {
            return FitTo.HEIGHT;
          }

          return FitTo.WIDTH;
        }),
    );
  }
}
