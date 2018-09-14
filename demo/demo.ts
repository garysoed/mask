import { instanceSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as getOrRegisterVineApp, VineImpl } from 'grapevine/export/main';
import { BooleanParser } from 'gs-tools/export/parse';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { BooleanType, ElementWithTagType, InstanceofType } from 'gs-types/export';
import { attribute, element, resolveLocators } from 'persona/export/locator';
import { getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { icon, Palette, start as startMask, textButton } from '../export';
import { $theme } from '../src/app/app';
import { iconButton } from '../src/component/icon-button';
import { textIconButton } from '../src/component/text-icon-button';
import { drawer } from '../src/section/drawer';
import { Theme } from '../src/theme/theme';
import { ThemedCustomElementCtrl } from '../src/theme/themed-custom-element-ctrl';
import demoTemplate from './demo.html';

const vineApp = getOrRegisterVineApp('demo');
const {builder, customElement, onDom, render} = getOrRegisterPersonaApp('demo', vineApp);
const {builder: vineBuilder} = vineApp;

const $ = resolveLocators({
  option: {
    el: element<HTMLElement|null>('#option', ElementWithTagType('mk-drawer')),
    expanded: attribute(element('option.el'), 'expanded', BooleanParser, BooleanType, false),
  },
  themeStyle: element('#theme', InstanceofType(HTMLStyleElement)),
});

const $isOnOption = instanceSourceId('isOnOption', BooleanType);
vineBuilder.source($isOnOption, false);

@customElement({
  tag: 'mk-demo',
  template: demoTemplate,
  watch: [
    $.option.el,
    $.themeStyle,
  ],
})
@render($.option.expanded).withForwarding($isOnOption)
class DemoCtrl extends ThemedCustomElementCtrl {
  constructor() {
    super($.themeStyle);
  }

  @onDom($.option.el, 'mouseout')
  onMouseOutOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, false, this);
  }

  @onDom($.option.el, 'mouseover')
  onMouseOverOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, true, this);
  }
}

const theme = new Theme(Palette.ORANGE, Palette.GREEN);
vineApp.builder.source($theme, theme);
const vine = vineApp.builder.run();
builder.build([DemoCtrl], window.customElements, vine);

const registeredFonts = ImmutableMap.of([
      [
        'material',
        {
          iconClass: 'material-icons',
          url: new URL('https://fonts.googleapis.com/icon?family=Material+Icons'),
        },
      ],
    ]);

const iconConfig = icon('material', registeredFonts);

window.addEventListener('load', () => {
  const {vine: maskVine} = startMask([
    drawer(),
    iconConfig,
    iconButton(iconConfig),
    textButton(),
    textIconButton(iconConfig),
  ], theme, document.getElementById('globalStyle') as HTMLStyleElement);
});
