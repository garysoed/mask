import { getOrRegisterApp as getOrRegisterVineApp, VineImpl } from 'grapevine/export/main';
import { HslColor } from 'gs-tools/export/color';
import { InstanceofType } from 'gs-types/export';
import { element, resolveLocators } from 'persona/export/locator';
import { CustomElementCtrl, getOrRegisterApp as getOrRegisterPersonaApp } from 'persona/export/main';
import { start as startMask, TextButton } from '../export';
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

builder.register([DemoCtrl], vineApp.builder);
builder.build(window.customElements, vineApp.builder.run());

window.addEventListener('load', () => {

  const globalStyle = document.getElementById('globalStyle');
  if (!globalStyle) {
    throw new Error('Missing global style element');
  }

  globalStyle.innerHTML = generalCss;
});

const theme = new Theme(HslColor.newInstance(45, 0.75, 0.5), HslColor.newInstance(90, 0.75, 0.5));
startMask([TextButton], theme);
