import { ImmutableMap } from 'gs-tools/src/immutable';
import { icon, Palette, start as startMask, textButton } from '../export';
import { $theme, _v } from '../src/app/app';
import { iconButton } from '../src/component/icon-button';
import { textIconButton } from '../src/component/text-icon-button';
import { breadcrumb } from '../src/display/breadcrumb';
import { croppedLine } from '../src/display/cropped-line';
import { drawer } from '../src/section/drawer';
import { Theme } from '../src/theme/theme';
import { demoCtrl } from './demo-ctrl';

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

window.addEventListener('load', () => {
  const {vine: maskVine} = startMask(
      [
        breadcrumb(),
        croppedLine(),
        drawer(),
        demoCtrl(),
        iconConfig,
        iconButton(iconConfig),
        textButton(),
        textIconButton(iconConfig),
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  maskVine.getObservable($theme).subscribe(theme => maskVine.setValue($theme, theme));
});
