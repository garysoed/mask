import {cache} from 'gs-tools/export/data';
import {Ctrl, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import template from './demo.html';


const $ = {
  host: {},
  shadow: {
    // accentPalette: element('accentPalette', elementWithTagType('div'), {
    //   content: multi('content'),
    //   onClick: onDom<MouseEvent>('click'),
    // }),
    // basePalette: element('basePalette', elementWithTagType('div'), {
    //   content: multi('content'),
    //   onClick: onDom<MouseEvent>('click'),
    // }),
    // content: element('content', elementWithTagType('div'), {
    //   content: single('content'),
    // }),
    // drawerRoot: element('drawerRoot', $div, {
    //   actionContents: multi('#actionContents'),
    //   displayContents: multi('#displayContents'),
    //   generalContents: multi('#generalContents'),
    //   layoutContents: multi('#layoutContents'),
    //   onAction: onDom(ACTION_EVENT),
    // }),
    // darkMode: element('darkMode', $checkbox, {}),
    // root: element('root', elementWithTagType('section'), {
    //   theme: attributeOut('mk-theme', stringParser()),
    // }),
    // rootLayout: element('rootLayout', $rootLayout, {
    //   onAction: onDom(ACTION_EVENT),
    // }),
    // settingsDrawer: element('settingsDrawer', $drawerLayout, {
    //   onMouseEnter: onDom('mouseenter'),
    //   onMouseLeave: onDom('mouseleave'),
    // }),
  },
};

// const PAGE_CTORS = ALL_SPECS.map(({ctor}) => ctor);
// const COMPONENT_PATH_ATTR = 'path';

// const darkModePath = mutablePathSource($demoStateId, demo => demo._('isDarkMode'));

class DemoCtrl implements Ctrl {
  constructor() {
    // this.addSetup(this.onAccentPaletteClick$);
    // this.addSetup(this.onBasePaletteClick$);
    // this.addSetup(this.onDrawerRootClick$);
    // this.addSetup(this.setupOnRootLayoutAction());
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      // this.renderers.accentPalette.content(this.accentPaletteContents$),
      // this.renderers.basePalette.content(this.basePaletteContents$),
      // this.renderers.darkMode.stateId(of(darkModePath.get(this.vine))),
      // this.renderers.content.content(this.mainContent$),
      // this.renderers.drawerRoot.actionContents(this.renderPageButtons(ACTION_SPECS)),
      // this.renderers.drawerRoot.displayContents(this.renderPageButtons(DISPLAY_SPECS)),
      // this.renderers.drawerRoot.generalContents(this.renderPageButtons(GENERAL_SPECS)),
      // this.renderers.drawerRoot.layoutContents(this.renderPageButtons(LAYOUT_SPECS)),
      // this.renderers.settingsDrawer.expanded(this.renderSettingsDrawerExpanded()),
      // this.renderers.root.theme(this.renderRootTheme()),
    ];
  }

  // @cache()
  // private get accentPaletteContents$(): Observable<readonly RenderSpec[]> {
  //   const selectedColor$ = $demoState.get(this.vine).$('accentColorName');
  //   const paletteNode$List = ORDERED_PALETTES
  //       .map(([colorName, color]) => {
  //         const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
  //         return renderPaletteData(
  //             colorName,
  //             color,
  //             isSelected$,
  //         );
  //       });

  //   return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  // }

  // @cache()
  // private get basePaletteContents$(): Observable<readonly RenderSpec[]> {
  //   const selectedColor$ = $demoState.get(this.vine).$('baseColorName');
  //   const paletteNode$List = ORDERED_PALETTES
  //       .map(([colorName, color]) => {
  //         const isSelected$ = selectedColor$.pipe(map(selectedName => selectedName === colorName));
  //         return renderPaletteData(
  //             colorName,
  //             color,
  //             isSelected$,
  //         );
  //       });

  //   return paletteNode$List.length <= 0 ? observableOf([]) : combineLatest(paletteNode$List);
  // }

  // @cache()
  // private get onDrawerRootClick$(): Observable<unknown> {
  //   return this.inputs.drawerRoot.onAction.pipe(
  //       tap(event => {
  //         const target = event.target;
  //         if (!(target instanceof HTMLElement)) {
  //           return;
  //         }

  //         const path = target.getAttribute(COMPONENT_PATH_ATTR) || null;
  //         if (!enumType<Views>(Views).check(path)) {
  //           return;
  //         }

  //         event.stopPropagation();
  //         $locationService.get(this.vine).goToPath(path, {});
  //       }),
  //   );
  // }

  // @cache()
  // private get mainContent$(): Observable<RenderSpec|null> {
  //   return $locationService.get(this.vine).location$.pipe(
  //       map(location => getPageSpec(location.type)),
  //       map(spec => {
  //         if (!spec) {
  //           return null;
  //         }

  //         return renderCustomElement({
  //           spec: spec.componentSpec,
  //           inputs: {},
  //           id: {},
  //         });
  //       }),
  //   );
  // }

  // private renderPageButtons(pageSpecs: readonly PageSpec[]): Observable<readonly RenderSpec[]> {
  //   const node$List = pageSpecs
  //       .map(({path, name}) => {
  //         return renderCustomElement({
  //           spec: $button,
  //           attrs: new Map([[COMPONENT_PATH_ATTR, `${path}`]]),
  //           children: [
  //             renderCustomElement({
  //               spec: $lineLayout,
  //               attrs: new Map([['mk-body-1', '']]),
  //               textContent: name,
  //               inputs: {},
  //               id: name,
  //             }),
  //           ],
  //           inputs: {
  //             isSecondary: observableOf(true),
  //           },
  //           id: name,
  //         });
  //       });

  //   return observableOf(node$List);
  // }

  // private renderRootTheme(): Observable<'light'|'dark'> {
  //   return $demoState.get(this.vine).$('isDarkMode').pipe(
  //       map(isDarkMode => isDarkMode ? 'dark' : 'light'),
  //   );
  // }

  // private renderSettingsDrawerExpanded(): Observable<boolean> {
  //   return merge(
  //       this.inputs.settingsDrawer.onMouseLeave.pipe(mapTo(false)),
  //       this.inputs.settingsDrawer.onMouseEnter.pipe(mapTo(true)),
  //   )
  //       .pipe(
  //           distinctUntilChanged(),
  //       );
  // }

  // @cache()
  // private get onAccentPaletteClick$(): Observable<unknown> {
  //   return this.inputs.accentPalette.onClick
  //       .pipe(
  //           map(event => getColor(event)),
  //           filterNonNullable(),
  //           $demoState.get(this.vine).$('accentColorName').set(),
  //       );
  // }

  // @cache()
  // private get onBasePaletteClick$(): Observable<unknown> {
  //   return this.inputs.basePalette.onClick
  //       .pipe(
  //           map(event => getColor(event)),
  //           filterNonNullable(),
  //           $demoState.get(this.vine).$('baseColorName').set(),
  //       );
  // }

  // private setupOnRootLayoutAction(): Observable<unknown> {
  //   return this.inputs.rootLayout.onAction
  //       .pipe(
  //           tap(() => {
  //             $locationService.get(this.vine).goToPath(Views.MAIN, {});
  //           }),
  //       );
  // }
}
export const DEMO = registerCustomElement({
  deps: [
    // ...PAGE_CTORS,
    // Button,
    // Checkbox,
    // DrawerLayout,
    // Overlay,
    // LayoutOverlay,
    // LineLayout,
    // ListItemLayout,
    // RootLayout,
  ],
  tag: 'mkd-demo',
  template,
  ctrl: DemoCtrl,
  spec: $,
});

// const ORDERED_PALETTES: ReadonlyArray<[keyof Palette, Color]> = [
//   ['RED', PALETTE.RED],
//   ['ORANGE', PALETTE.ORANGE],
//   ['AMBER', PALETTE.AMBER],
//   ['YELLOW', PALETTE.YELLOW],
//   ['LIME', PALETTE.LIME],
//   ['GREEN', PALETTE.GREEN],
//   ['TEAL', PALETTE.TEAL],
//   ['CYAN', PALETTE.CYAN],
//   ['AZURE', PALETTE.AZURE],
//   ['BLUE', PALETTE.BLUE],
//   ['VIOLET', PALETTE.VIOLET],
//   ['PURPLE', PALETTE.PURPLE],
//   ['MAGENTA', PALETTE.MAGENTA],
//   ['PINK', PALETTE.PINK],
//   ['BROWN', PALETTE.BROWN],
//   ['GREY', PALETTE.GREY],
// ];

// function renderPaletteData(
//     colorName: string,
//     color: Color,
//     selected$: Observable<boolean>,
// ): Observable<RenderSpec> {
//   const colorCss = `rgb(${color.red}, ${color.green}, ${color.blue})`;

//   const classes$ = selected$.pipe(
//       map(selected => {
//         return selected ? ['palette', 'selected'] : ['palette'];
//       }),
//       map(classes => classes.join(' ')),
//   );

//   return observableOf(renderElement({
//     tag: 'div',
//     attrs: new Map<string, string|Observable<string>>([
//       ['class', classes$],
//       ['color', colorName],
//       ['style', `background-color: ${colorCss};`],
//     ]),
//     id: colorName,
//   }));
// }

// function getColor(event: MouseEvent): keyof Palette|null {
//   const target = event.target;
//   if (!(target instanceof HTMLElement)) {
//     return null;
//   }

//   const colorName = target.getAttribute('color');
//   if (!colorName) {
//     return null;
//   }

//   return colorName as keyof Palette;
// }
