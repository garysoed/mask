import { Vine } from '@grapevine';
import { Jsons } from '@gs-tools/data';
import { InstanceofType } from '@gs-types';
import { classlist, element, InitFn, style } from '@persona';
import { BehaviorSubject, Observable } from '@rxjs';
import { map, switchMap } from '@rxjs/operators';

import { _p, _v } from '../../app/app';
import layoutOverlaySvg from '../../asset/layout_overlay.svg';
import { $svgConfig, $svgService } from '../../display/svg-service';
import { ThemedCustomElementCtrl } from '../../theme/themed-custom-element-ctrl';

import layoutOverlayTemplate from './layout-overlay.html';

const $isActive = _v.source(() => new BehaviorSubject(false), globalThis);

const $ = {
  gridLeft: element('gridLeft', InstanceofType(HTMLDivElement), {
    backgroundImage: style('backgroundImage'),
  }),
  gridRight: element('gridRight', InstanceofType(HTMLDivElement), {
    backgroundImage: style('backgroundImage'),
  }),
  root: element('root', InstanceofType(HTMLDivElement), {
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
  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.root._.classlist).withVine(_v.stream(this.handleIsActiveChange, this)),
      _p.render($.gridLeft._.backgroundImage, $.gridRight._.backgroundImage)
          .withVine(_v.stream(this.renderBackgroundImage, this)),
    ];
  }

  handleIsActiveChange(vine: Vine): Observable<string[]> {
    return $isActive.get(vine).pipe(map(isActive => isActive ? ['active'] : []));
  }

  renderBackgroundImage(vine: Vine): Observable<string> {
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
