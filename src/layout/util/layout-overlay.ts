import {source, Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {classlist, element, PersonaContext, style, ValuesOf} from 'persona';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {_p, _v} from '../../app/app';
import layoutOverlaySvg from '../../asset/layout_overlay.svg';
import {$svgService, registerSvg} from '../../core/svg-service';
import {BaseThemedCtrl} from '../../theme/base-themed-ctrl';

import layoutOverlayTemplate from './layout-overlay.html';


const $isActive = source('layout.isActive', () => false);

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
    registerSvg(vine, 'layout_overlay', {type: 'embed', content: layoutOverlaySvg});
  },
  tag: 'mk-layout-overlay',
  template: layoutOverlayTemplate,
  api: {},
})
export class LayoutOverlay extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get values(): ValuesOf<typeof $> {
    return {
      root: {classlist: this.rootClasslist$},
      gridLeft: {backgroundImage: this.backgroundImage$},
      gridRight: {backgroundImage: this.backgroundImage$},
    };
  }

  @cache()
  private get rootClasslist$(): Observable<ReadonlySet<string>> {
    return $isActive.get(this.vine)
        .pipe(map(isActive => isActive ? new Set(['active']) : new Set([])));
  }

  @cache()
  private get backgroundImage$(): Observable<string> {
    return $svgService.get(this.vine)
        .pipe(
            switchMap(service => service.getSvg('layout_overlay')),
            map(svg => `url('data:image/svg+xml;base64,${btoa(svg || '')}')`),
        );
  }
}

_v.onRun(vine => {
  Object.assign(
      window,
      {
        mk: {
          dbg: {
            setLayoutOverlayActive: (active: boolean) => {
              $isActive.set(vine, () => active);
            },
          },
        },
      },
  );
});
