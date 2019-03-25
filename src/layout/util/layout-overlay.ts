import { staticSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { $pipe, $push } from 'gs-tools/export/collect';
import { Jsons } from 'gs-tools/export/data';
import { BooleanType, InstanceofType } from 'gs-types/export';
import { element } from 'persona/export/input';
import { CustomElementCtrl } from 'persona/export/main';
import { classlist, style } from 'persona/export/output';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { _p, _v } from '../../app/app';
import * as layoutOverlaySvg from '../../asset/layout_overlay.svg';
import { SvgConfig } from '../../display/svg-config';
import { $svgConfig, $svgService, SvgService } from '../../display/svg-service';
import layoutOverlayTemplate from './layout-overlay.html';

const $isActive = staticSourceId('isActive', BooleanType);
_v.builder.source($isActive, false);

const $ = {
  root: element('root', InstanceofType(HTMLDivElement), {
    backgroundImage: style('backgroundImage'),
    classlist: classlist(),
  }),
};

@_p.customElement({
  configure(vine: VineImpl): void {
    vine.getObservable($svgConfig)
        .pipe(take(1))
        .subscribe(svgConfig => {
          const newConfig = $pipe(
              svgConfig,
              $push<[string, SvgConfig], string>(
                  ['layout_overlay', {type: 'embed', content: layoutOverlaySvg}],
              ),
          );

          vine.setValue($svgConfig, newConfig);
        });
  },
  tag: 'mk-layout-overlay',
  template: layoutOverlayTemplate,
})
export class LayoutOverlay extends CustomElementCtrl {
  @_p.render($.root._.classlist)
  handleIsActiveChange(
      @_v.vineIn($isActive) isActiveObs: Observable<boolean>,
  ): Observable<string[]> {
    return isActiveObs.pipe(map(isActive => isActive ? ['active'] : []));
  }

  @_p.render($.root._.backgroundImage)
  renderBackgroundImage(
      @_v.vineIn($svgService) svgServiceObs: Observable<SvgService>,
  ): Observable<string> {
    return svgServiceObs
        .pipe(
            switchMap(service => service.getSvg('layout_overlay')),
            map(svg => `url('data:image/svg+xml;base64,${btoa(svg || '')}')`),
        );
  }
}

_v.builder.onRun(vine => {
  Jsons.setValue(window, 'mk.dbg.setLayoutOverlayActive', (active: boolean) => {
    vine.setValue($isActive, active);
  });
});
