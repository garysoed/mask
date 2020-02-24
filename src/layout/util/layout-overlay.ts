import { source, Vine } from 'grapevine';
import { Jsons } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { classlist, element, style } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { _p, _v } from '../../app/app';
import layoutOverlaySvg from '../../asset/layout_overlay.svg';
import { $svgConfig, $svgService } from '../../display/svg-service';
import { ThemedCustomElementCtrl } from '../../theme/themed-custom-element-ctrl';

import layoutOverlayTemplate from './layout-overlay.html';


const $isActive = source(() => new BehaviorSubject(false), globalThis);

const $ = {
  gridLeft: element('gridLeft', instanceofType(HTMLDivElement), {
    backgroundImage: style('backgroundImage'),
  }),
  gridRight: element('gridRight', instanceofType(HTMLDivElement), {
    backgroundImage: style('backgroundImage'),
  }),
  root: element('root', instanceofType(HTMLDivElement), {
    classlist: classlist(),
  }),
};

@_p.customElement({
  configure(vine: Vine): void {
    const svgConfigSubject = $svgConfig.get(vine);
    svgConfigSubject.next({
      key: 'layout_overlay',
      type: 'set',
      value: {type: 'embed', content: layoutOverlaySvg},
    });
  },
  tag: 'mk-layout-overlay',
  template: layoutOverlayTemplate,
})
export class LayoutOverlay extends ThemedCustomElementCtrl {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.root._.classlist).withFunction(this.handleIsActiveChange);
    this.render($.gridLeft._.backgroundImage, $.gridRight._.backgroundImage)
        .withFunction(this.renderBackgroundImage);
  }

  private handleIsActiveChange(vine: Vine): Observable<ReadonlySet<string>> {
    return $isActive.get(vine).pipe(map(isActive => isActive ? new Set(['active']) : new Set([])));
  }

  private renderBackgroundImage(vine: Vine): Observable<string> {
    return $svgService
        .get(vine)
        .pipe(
            switchMap(service => service.getSvg('layout_overlay')),
            map(svg => `url('data:image/svg+xml;base64,${btoa(svg || '')}')`),
        );
  }
}

_v.onRun(vine => {
  Jsons.setValue(window, 'mk.dbg.setLayoutOverlayActive', (active: boolean) => {
    $isActive.get(vine).next(active);
  });
});
