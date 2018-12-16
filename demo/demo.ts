import { Jsons } from 'gs-tools/export/data';
import { ImmutableMap } from 'gs-tools/src/immutable';
import { icon, Palette, start as startMask } from '../export';
import { $theme, _v } from '../src/app/app';
import { textIconButton } from '../src/component/text-icon-button';
import { breadcrumb } from '../src/display/breadcrumb';
import { croppedLine } from '../src/display/cropped-line';
import { iconWithText } from '../src/display/icon-with-text';
import { textInput } from '../src/input/text-input';
import { backdrop } from '../src/section/backdrop';
import { dialog } from '../src/section/dialog';
import { $dialogService } from '../src/section/dialog-service';
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
const iconWithTextConfig = iconWithText(iconConfig);
const textIconButtonConfig = textIconButton(iconWithTextConfig);

window.addEventListener('load', () => {
  const {vine: maskVine} = startMask(
      [
        breadcrumb(),
        croppedLine(),
        demoCtrl(),
        dialog(backdrop(), textIconButtonConfig),
        drawer(),
        iconConfig,
        iconWithTextConfig,
        textIconButtonConfig,
        textInput(),
      ],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement);

  maskVine.getObservable($theme).subscribe(theme => maskVine.setValue($theme, theme));
  maskVine.getObservable($dialogService).subscribe(service => {
    Jsons.setValue(window, 'demo.dialogService', service);
  });
});
