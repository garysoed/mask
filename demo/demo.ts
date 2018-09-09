import { instanceSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as getOrRegisterVineApp, VineImpl } from 'grapevine/export/main';
import { BooleanParser } from 'gs-tools/export/parse';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { BooleanType, ElementWithTagType, InstanceofType } from 'gs-types/export';
import { attribute, element, resolveLocators } from 'persona/export/locator';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { icon, Palette, start as startMask, textButton } from '../export';
import { iconButton } from '../src/component/icon-button';
import { drawer } from '../src/section/drawer';
import * as generalCss from '../src/theme/general.css';
import { Theme } from '../src/theme/theme';
import demoTemplate from './demo.html';

const vineApp = getOrRegisterVineApp('demo');
const {builder, customElement, onDom, render} = getOrRegisterPersonaApp('demo', vineApp);
const {builder: vineBuilder, vineIn} = vineApp;

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
class DemoCtrl extends CustomElementCtrl {
  init(vine: VineImpl): void {
    vine.listen(
        el => el.innerHTML = generalCss,
        this,
        $.themeStyle.getReadingId());
  }

  @onDom($.option.el, 'mouseout')
  onMouseOutOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, false, this);
  }

  @onDom($.option.el, 'mouseover')
  onMouseOverOption_(_: unknown, vine: VineImpl): void {
    vine.setValue($isOnOption, true, this);
  }

  // TODO: Simplify this.
  @render($.option.expanded)
  renderOptionExpanded_(@vineIn($isOnOption) isOnOption: boolean): boolean {
    return isOnOption;
  }
}


const vine = vineApp.builder.run();
builder.build([DemoCtrl], window.customElements, vine);

// TODO: This needs to be simplified.
window.addEventListener('load', () => {
  const globalStyle = document.getElementById('globalStyle');
  if (!globalStyle) {
    throw new Error('Missing global style element');
  }

  globalStyle.innerHTML = generalCss;
});

const theme = new Theme(Palette.ORANGE, Palette.GREEN);
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
startMask([
  drawer(),
  iconConfig,
  iconButton(iconConfig),
  textButton(),
], theme);
