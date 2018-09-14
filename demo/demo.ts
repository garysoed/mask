import { ImmutableMap } from 'gs-tools/src/immutable';
import { icon, Palette, start as startMask, textButton } from '../export';
import { $theme } from '../src/app/app';
import { iconButton } from '../src/component/icon-button';
import { textIconButton } from '../src/component/text-icon-button';
import { drawer } from '../src/section/drawer';
import { Theme } from '../src/theme/theme';
import { demoApp } from './demo-app';
import { DemoCtrl } from './demo-ctrl';

const theme = new Theme(Palette.ORANGE, Palette.GREEN);
demoApp.vine.builder.source($theme, theme);
const vine = demoApp.vine.builder.run();
demoApp.persona.builder.build([DemoCtrl], window.customElements, vine);

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

  vine.listen(theme => maskVine.setValue($theme, theme), $theme);
});
