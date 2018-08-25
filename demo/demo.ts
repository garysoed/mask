import { getOrRegisterApp as getOrRegisterVineApp, VineImpl } from 'grapevine/export/main';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { InstanceofType } from 'gs-types/export';
import { element, resolveLocators } from 'persona/export/locator';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { icon, Palette, start as startMask, textButton } from '../export';
import { iconButton } from '../src/component/icon-button';
import * as generalCss from '../src/theme/general.css';
import { Theme } from '../src/theme/theme';
import demoTemplate from './demo.html';

const vineApp = getOrRegisterVineApp('demo');
const {builder, customElement} = getOrRegisterPersonaApp('demo', vineApp);


const $ = resolveLocators({
  themeStyle: element('#theme', InstanceofType(HTMLStyleElement)),
});

@customElement({
  tag: 'mk-demo',
  template: demoTemplate,
  watch: [$.themeStyle],
})
class DemoCtrl extends CustomElementCtrl {
  init(vine: VineImpl): void {
    vine.listen(
        el => el.innerHTML = generalCss,
        this,
        $.themeStyle.getReadingId());
  }
}

const vine = vineApp.builder.run();
builder.build([DemoCtrl], window.customElements, vine);

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
startMask([
  icon('material', registeredFonts),
  iconButton('material', registeredFonts),
  textButton(),
], theme);
