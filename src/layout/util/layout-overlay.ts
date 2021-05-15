import {source, Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {$div, classlist, element, PersonaContext, style} from 'persona';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {_p} from '../../app/app';
import layoutOverlaySvg from '../../asset/layout_overlay.svg';
import {$svgService, registerSvg} from '../../core/svg-service';
import {BaseThemedCtrl} from '../../theme/base-themed-ctrl';

import layoutOverlayTemplate from './layout-overlay.html';


const $isActive = source('layout.isActive', () => new BehaviorSubject(false));

const $ = {
  gridLeft: element('gridLeft', $div, {
    backgroundImage: style('backgroundImage'),
  }),
  gridRight: element('gridRight', $div, {
    backgroundImage: style('backgroundImage'),
  }),
  root: element('root', $div, {
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
    Object.assign(
        window,
        {
          mk: {
            dbg: {
              setLayoutOverlayActive: (active: boolean) => {
                $isActive.get(this.vine).next(active);
              },
            },
          },
        },
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.root.classlist(this.rootClasslist$),
      this.renderers.gridLeft.backgroundImage(this.backgroundImage$),
      this.renderers.gridRight.backgroundImage(this.backgroundImage$),
    ];
  }

  @cache()
  private get rootClasslist$(): Observable<ReadonlySet<string>> {
    return $isActive.get(this.vine)
        .pipe(map(isActive => isActive ? new Set(['active']) : new Set([])));
  }

  @cache()
  private get backgroundImage$(): Observable<string> {
    return $svgService.get(this.vine).getSvg('layout_overlay')
        .pipe(
            map(svg => `url('data:image/svg+xml;base64,${btoa(svg || '')}')`),
        );
  }
}
