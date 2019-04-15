// import { staticSourceId } from '@grapevine/component';
// import { VineImpl } from '@grapevine/main';
// import { $pipe, $push } from '@gs-tools/collect';
// import { Jsons } from '@gs-tools/data';
// import { BooleanType, InstanceofType } from '@gs-types';
// import { element } from '@persona/input';
// import { classlist, style } from '@persona/output';
// import { Observable } from 'rxjs';
// import { map, switchMap, take } from 'rxjs/operators';
// import { _p, _v } from '../../app/app';
// import * as layoutOverlaySvg from '../../asset/layout_overlay.svg';
// import { SvgConfig } from '../../display/svg-config';
// import { $svgConfig, $svgService, SvgService } from '../../display/svg-service';
// import { ThemedCustomElementCtrl } from '../../theme/themed-custom-element-ctrl';
// import layoutOverlayTemplate from './layout-overlay.html';

// const $isActive = staticSourceId('isActive', BooleanType);
// _v.builder.source($isActive, false);

// const $ = {
//   gridLeft: element('gridLeft', InstanceofType(HTMLDivElement), {
//     backgroundImage: style('backgroundImage'),
//   }),
//   gridRight: element('gridRight', InstanceofType(HTMLDivElement), {
//     backgroundImage: style('backgroundImage'),
//   }),
//   root: element('root', InstanceofType(HTMLDivElement), {
//     classlist: classlist(),
//   }),
// };

// @_p.customElement({
//   configure(vine: VineImpl): void {
//     vine.getObservable($svgConfig)
//         .pipe(take(1))
//         .subscribe(svgConfig => {
//           const newConfig = $pipe(
//               svgConfig,
//               $push<[string, SvgConfig], string>(
//                   ['layout_overlay', {type: 'embed', content: layoutOverlaySvg}],
//               ),
//           );

//           vine.setValue($svgConfig, newConfig);
//         });
//   },
//   tag: 'mk-layout-overlay',
//   template: layoutOverlayTemplate,
// })
// export class LayoutOverlay extends ThemedCustomElementCtrl {
//   @_p.render($.root._.classlist)
//   handleIsActiveChange(
//       @_v.vineIn($isActive) isActiveObs: Observable<boolean>,
//   ): Observable<string[]> {
//     return isActiveObs.pipe(map(isActive => isActive ? ['active'] : []));
//   }

//   @_p.render($.gridLeft._.backgroundImage)
//   @_p.render($.gridRight._.backgroundImage)
//   renderBackgroundImage(
//       @_v.vineIn($svgService) svgServiceObs: Observable<SvgService>,
//   ): Observable<string> {
//     return svgServiceObs
//         .pipe(
//             switchMap(service => service.getSvg('layout_overlay')),
//             map(svg => `url('data:image/svg+xml;base64,${btoa(svg || '')}')`),
//         );
//   }
// }

// _v.builder.onRun(vine => {
//   Jsons.setValue(window, 'mk.dbg.setLayoutOverlayActive', (active: boolean) => {
//     vine.setValue($isActive, active);
//   });
// });